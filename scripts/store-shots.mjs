/* App Store screenshots at the exact pixel size Apple validates.
   Run after `npm run build && npx vite preview --port 4173`.

   ⚠️ These are NOT the same as shots/ — those are repo previews at
   860x1760. App Store Connect checks dimensions to the pixel and
   rejects anything else, and screenshots that no longer match the
   app are a 2.3.3 rejection, so regenerate after any UI change.

     iPhone 6.9"  1290x2796   = 430x932 logical at dsf 3
     iPad 13"     2064x2752   = 1032x1376 logical at dsf 2

   The iPad set is only needed if the app ships an iPad build. */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const BASE = process.env.BASE || 'http://localhost:4173'
const OUT = process.env.OUT || 'store-assets/iphone-6.9'
const KEY = 'jojot:state:v1'
const RECEIPT_KEY = 'jojot:receipt:v1'

const W = 430
const H = 932
const DSF = 3
const EXPECT = `${W * DSF}x${H * DSF}`

const iso = (offsetDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const ENTITLEMENT = {
  planId: 'monthly',
  productId: 'jojot.premium.monthly',
  purchasedISO: iso(-11),
  renewsISO: iso(19),
}

/* Day 42 of 75 reads as a real, lived-in run — a fresh day 1 with an
   empty list makes the app look like it does nothing. */
const STATE = {
  onboarded: true,
  name: 'Sofia',
  challengeId: 'hard',
  startedISO: iso(-41),
  taskOverrides: {},
  customChallenges: [],
  logs: { 42: { done: ['diet', 'workout', 'water', 'read'], water: 3900, steps: 11204 } },
  entitlement: ENTITLEMENT,
  remindersOn: true,
  shareWithFriends: true,
}

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: DSF,
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()

for (let i = 0; i < 40; i++) {
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 2000 })
    break
  } catch {
    await new Promise((r) => setTimeout(r, 500))
  }
}

const seed = async (state) => {
  await page.evaluate(
    ([k, v, rk, rv]) => {
      localStorage.setItem(k, v)
      if (rv) localStorage.setItem(rk, rv)
      else localStorage.removeItem(rk)
    },
    [KEY, JSON.stringify(state), RECEIPT_KEY, state.entitlement ? JSON.stringify(state.entitlement) : null],
  )
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
}

const shots = []
const shot = async (name) => {
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path })
  shots.push(path)
  console.log(`  ${name}`)
}

// 1 — onboarding
await page.evaluate(
  ([k, rk]) => {
    localStorage.removeItem(k)
    localStorage.removeItem(rk)
  },
  [KEY, RECEIPT_KEY],
)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await shot('01-keep-the-promise')

// 2 — paywall
await seed({ ...STATE, entitlement: null, challengeId: null, startedISO: null, logs: {} })
await shot('02-paywall')

// 3 — challenge picker
await seed({ ...STATE, challengeId: null, startedISO: null, logs: {} })
await shot('03-choose-a-challenge')

// 4 — today, mid-run
await seed(STATE)
await shot('04-today')

// 5 — water
await seed(STATE)
await page.locator('.tab').nth(1).click()
await page.waitForTimeout(1200)
await shot('05-water')

// 6 — you (v1.1: four tabs now, You is the fourth)
await seed(STATE)
await page.locator('.tab').nth(3).click()
await page.waitForTimeout(1200)
await shot('06-you')

// 7 — friends, via the screenshot fixture (live data needs two signed-in devices)
const at = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString() }
const FRIENDS_FIXTURE = {
  code: 'K4TQ7M2P',
  pending: [{ friendship_id: 'fx-1', requester_name: 'Emma', requested_at: at(8, 3) }],
  friends: [
    { profileId: 'fx-a', name: 'Maya', challengeName: '75 Soft', dayNo: 12, tasks: [
      { id: 't1', text: 'Morning stretch', done: true, done_at: at(7, 12) },
      { id: 't2', text: 'Walk 8,000 steps', done: true, done_at: at(18, 48) },
      { id: 't3', text: 'Drink 2L of water', done: true, done_at: at(20, 5) },
      { id: 't4', text: 'No sugar today', done: false, done_at: null },
    ]},
    { profileId: 'fx-b', name: 'Chris', challengeName: '75 Strict', dayNo: 34, tasks: [
      { id: 't1', text: 'Two 45-minute workouts', done: true, done_at: at(6, 40) },
      { id: 't2', text: 'Read 10 pages', done: true, done_at: at(21, 15) },
      { id: 't3', text: 'Progress picture', done: false, done_at: null },
    ]},
  ],
}
await seed(STATE)
await page.evaluate((f) => localStorage.setItem('jojot:shot:friends', f), JSON.stringify(FRIENDS_FIXTURE))
await page.locator('.tab').nth(2).click()
await page.waitForTimeout(1200)
await shot('07-friends')
await page.evaluate(() => localStorage.removeItem('jojot:shot:friends'))

await browser.close()

/* Apple validates to the pixel, so assert rather than trust. */
console.log('')
let bad = 0
for (const p of shots) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', p]).toString()
  const w = out.match(/pixelWidth:\s*(\d+)/)?.[1]
  const h = out.match(/pixelHeight:\s*(\d+)/)?.[1]
  const got = `${w}x${h}`
  if (got !== EXPECT) {
    console.error(`✗ ${p} is ${got}, expected ${EXPECT}`)
    bad++
  }
}
if (bad) {
  console.error(`\n${bad} screenshot(s) are the wrong size — App Store Connect will reject them.`)
  process.exit(1)
}
console.log(`✓ ${shots.length} screenshots, all exactly ${EXPECT}`)
