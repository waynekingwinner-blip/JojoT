/* Regenerate shots/ — run `npm run build && npx vite preview --port 4173` first. */
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:4173'
const KEY = 'jojot:state:v1'

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

const BASE_STATE = {
  onboarded: true,
  name: 'Sofia',
  challengeId: 'hard',
  startedISO: iso(-11), // -> day 12
  taskOverrides: {},
  customChallenges: [],
  logs: { 12: { done: ['diet', 'workout'], water: 1500, steps: 8420 } },
  entitlement: ENTITLEMENT,
  remindersOn: true,
  shareWithFriends: true,
}

const seed = (extra = {}) => JSON.stringify({ ...BASE_STATE, ...extra })

async function waitForServer(page) {
  for (let i = 0; i < 40; i++) {
    try {
      await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 2000 })
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('server never came up')
}

const set = async (page, value) => {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, value])
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1100)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 430, height: 880 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await waitForServer(page)

// 1) Onboarding (fresh install)
await page.evaluate((k) => localStorage.removeItem(k), KEY)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/01-onboarding.png' })

// 2) Paywall — straight after onboarding
await set(page, JSON.stringify({ onboarded: true, name: 'Sofia' }))
await page.screenshot({ path: 'shots/02-paywall.png' })

// 2b) Paywall, yearly selected
await page.getByText('Yearly', { exact: true }).click().catch(() => {})
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/02b-paywall-yearly.png' })

// 3) Challenge select
await set(page, JSON.stringify({ onboarded: true, name: 'Sofia', entitlement: ENTITLEMENT }))
await page.screenshot({ path: 'shots/03-challenges.png' })

// 3b) Challenge detail
await page.getByText('75 Day Hard', { exact: true }).first().click().catch(() => {})
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/03b-challenge-detail.png' })

// 4) Today
await set(page, seed())
await page.screenshot({ path: 'shots/04-today.png' })

const tabs = page.locator('.tab')

// 5) Water
await tabs.nth(1).click()
await page.waitForTimeout(1400)
await page.screenshot({ path: 'shots/05-water.png' })

// 6) Friends
await tabs.nth(2).click()
await page.waitForTimeout(1400)
await page.screenshot({ path: 'shots/06-friends.png' })

// 7) You
await tabs.nth(3).click()
await page.waitForTimeout(1400)
await page.screenshot({ path: 'shots/07-profile.png' })

// 7b) You, scrolled to settings
await page.locator('.scroll').last().evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }))
await page.waitForTimeout(800)
await page.screenshot({ path: 'shots/07b-settings.png' })

await browser.close()
console.log('done')
