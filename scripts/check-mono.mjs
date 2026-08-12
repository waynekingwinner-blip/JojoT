/* Proves the app is black and white, two ways:

   1. COMPUTED STYLES — walks every element on every screen and reads the
      resolved value of every colour-bearing property (including gradients,
      shadows and SVG fill/stroke). Any rgb() whose channels differ fails.
   2. RENDERED PIXELS — screenshots each screen and inspects every pixel,
      which also catches things CSS can't declare: emoji, images, canvas.

   Run against `npx vite preview --port 4173`. Exits non-zero on any colour. */
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:4173'
const KEY = 'jojot:state:v1'
/* The launch entitlement check asks the store, and in web/mock mode the
   store is this receipt. Seeding app state without it means the check
   correctly concludes there is no subscription and bounces to the paywall. */
const RECEIPT_KEY = 'jojot:receipt:v1'


// Channel spread allowed before we call something "coloured".
// Computed styles are exact, so 2 is generous. Pixels get more slack because
// subpixel text antialiasing can fringe by a few counts.
const STYLE_TOLERANCE = 2
const PIXEL_TOLERANCE = 12

const iso = (o = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + o)
  return d.toISOString().slice(0, 10)
}

const ENTITLEMENT = {
  planId: 'monthly',
  productId: 'jojot.premium.monthly',
  purchasedISO: iso(-11),
  renewsISO: iso(19),
}

const RUNNING = {
  onboarded: true,
  name: 'Sofia',
  challengeId: 'hard',
  startedISO: iso(-11),
  taskOverrides: {},
  customChallenges: [],
  logs: { 12: { done: ['diet', 'workout'], water: 1500, steps: 8420, photo: '#b6b6b6' } },
  entitlement: ENTITLEMENT,
  remindersOn: true,
  shareWithFriends: true,
}

/** Every screen, and how to get there. */
const SCREENS = [
  { name: 'onboarding', state: null },
  { name: 'onboarding/name', state: null, after: async (p) => {
      for (const label of ['Next', 'Next', 'Get started']) {
        await p.getByRole('button', { name: label }).click()
        await p.waitForTimeout(450)
      }
    } },
  { name: 'paywall', state: { onboarded: true, name: 'Sofia' } },
  { name: 'paywall/yearly', state: { onboarded: true, name: 'Sofia' }, after: async (p) => {
      await p.getByText('Yearly', { exact: true }).click()
      await p.waitForTimeout(400)
    } },
  { name: 'challenges', state: { onboarded: true, name: 'Sofia', entitlement: ENTITLEMENT } },
  { name: 'challenge-detail', state: { onboarded: true, name: 'Sofia', entitlement: ENTITLEMENT }, after: async (p) => {
      await p.getByText('75 Strict', { exact: true }).first().click()
      await p.waitForTimeout(700)
    } },
  { name: 'create-challenge', state: { onboarded: true, name: 'Sofia', entitlement: ENTITLEMENT }, after: async (p) => {
      await p.getByText('Create your own').click()
      await p.waitForTimeout(600)
      await p.getByText('+ Drink 3 L of water').click()
      await p.waitForTimeout(400)
    } },
  { name: 'today', state: RUNNING },
  { name: 'today/editing', state: RUNNING, after: async (p) => {
      await p.getByRole('button', { name: 'Edit list' }).click()
      await p.waitForTimeout(500)
    } },
  { name: 'today/photo-sheet', state: RUNNING, after: async (p) => {
      await p.getByRole('button', { name: 'Take progress picture' }).click()
      await p.waitForTimeout(700)
    } },
  { name: 'water', state: RUNNING, tab: 1 },
  { name: 'profile', state: RUNNING, tab: 2 },
  { name: 'profile/scrolled', state: RUNNING, tab: 2, after: async (p) => {
      await p.locator('.scroll').last().evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
      await p.waitForTimeout(600)
    } },
  { name: 'profile/confirm-sheet', state: RUNNING, tab: 2, after: async (p) => {
      await p.locator('.link-btn', { hasText: 'Cancel subscription' }).click()
      await p.waitForTimeout(700)
    } },
]

/* ---- in-page: audit every computed colour ---- */
const auditStyles = (tolerance) =>
  Array.from(document.querySelectorAll('*')).flatMap((el) => {
    const cs = getComputedStyle(el)
    const props = [
      'color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor',
      'borderBottomColor', 'borderLeftColor', 'outlineColor', 'boxShadow', 'fill', 'stroke',
      'textDecorationColor', 'caretColor', 'columnRuleColor',
    ]
    const out = []
    for (const prop of props) {
      const value = cs[prop]
      if (!value || value === 'none') continue
      const matches = value.match(/rgba?\([^)]+\)/g) || []
      for (const m of matches) {
        const parts = m.replace(/rgba?\(|\)/g, '').split(/[,\s/]+/).filter(Boolean).map(Number)
        const [r, g, b] = parts
        const a = parts.length > 3 ? parts[3] : 1
        if (a === 0) continue
        const spread = Math.max(r, g, b) - Math.min(r, g, b)
        if (spread > tolerance) {
          out.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 40),
            prop,
            value: m,
            spread,
          })
        }
      }
    }
    return out
  })

/* ---- in-page: audit every rendered pixel of a screenshot ---- */
const auditPixels = ([dataUrl, tolerance]) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('screenshot failed to decode'))
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const { data } = ctx.getImageData(0, 0, c.width, c.height)
      let worst = 0
      let bad = 0
      let sample = null
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const spread = Math.max(r, g, b) - Math.min(r, g, b)
        if (spread > worst) {
          worst = spread
          sample = `rgb(${r},${g},${b}) at ${((i / 4) % c.width)},${Math.floor(i / 4 / c.width)}`
        }
        if (spread > tolerance) bad++
      }
      resolve({ worst, bad, sample, total: data.length / 4 })
    }
    img.src = dataUrl
  })

/* ------------------------------------------------------------------ */

// --disable-lcd-text forces greyscale font antialiasing. Without it Chromium
// renders glyph edges with RGB subpixel fringes — rgb(17,109,201) and its
// mirror rgb(201,109,17) — which is a display artefact of the screenshot, not
// colour in the app. Turning it off lets the pixel audit measure real colour.
const browser = await chromium.launch({ args: ['--disable-lcd-text', '--force-color-profile=srgb'] })
const ctx = await browser.newContext({ viewport: { width: 430, height: 880 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
await page.goto(BASE, { waitUntil: 'networkidle' })

let failures = 0
let worstPixel = 0

for (const screen of SCREENS) {
  if (screen.state) {
    await page.evaluate(
      ([k, v, rk, rv]) => {
        localStorage.setItem(k, v)
        if (rv) localStorage.setItem(rk, rv)
        else localStorage.removeItem(rk)
      },
      [KEY, JSON.stringify(screen.state), RECEIPT_KEY, screen.state.entitlement ? JSON.stringify(screen.state.entitlement) : null],
    )
  } else {
    await page.evaluate(([k, rk]) => {
      localStorage.removeItem(k)
      localStorage.removeItem(rk)
    }, [KEY, RECEIPT_KEY])
  }
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  if (screen.tab != null) {
    await page.locator('.tab').nth(screen.tab).click()
    await page.waitForTimeout(800)
  }
  if (screen.after) await screen.after(page)
  await page.waitForTimeout(500)

  // 1. computed styles
  const styleHits = await page.evaluate(auditStyles, STYLE_TOLERANCE)

  // 2. rendered pixels
  const shot = await page.screenshot()
  const dataUrl = `data:image/png;base64,${shot.toString('base64')}`
  const px = await page.evaluate(auditPixels, [dataUrl, PIXEL_TOLERANCE])
  worstPixel = Math.max(worstPixel, px.worst)

  const styleBad = styleHits.length > 0
  const pixelBad = px.bad > 0
  if (styleBad || pixelBad) {
    failures++
    console.log(`FAIL  ${screen.name}`)
    for (const h of styleHits.slice(0, 6)) {
      console.log(`        style  <${h.tag} class="${h.cls}"> ${h.prop}: ${h.value}  (spread ${h.spread})`)
    }
    if (styleHits.length > 6) console.log(`        …and ${styleHits.length - 6} more style hits`)
    if (pixelBad) {
      console.log(`        pixels ${px.bad}/${px.total} over tolerance, worst ${px.worst} — ${px.sample}`)
    }
  } else {
    console.log(`  ok  ${screen.name.padEnd(24)} styles clean · max pixel channel spread ${px.worst}`)
  }
}

await browser.close()

console.log('\n———')
if (failures) {
  console.log(`${failures}/${SCREENS.length} screens contain colour`)
  process.exit(1)
}
console.log(`monochrome: ${SCREENS.length}/${SCREENS.length} screens clean`)
console.log(`worst channel spread across all rendered pixels: ${worstPixel} (tolerance ${PIXEL_TOLERANCE})`)
