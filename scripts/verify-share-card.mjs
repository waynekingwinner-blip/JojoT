/* Render the share card through the real app code path and save it
   to scratch/ so it can be eyeballed. Run after `vite preview`. */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4173'
const OUT = process.env.OUT || 'scratch'
const KEY = 'jojot:state:v1'
/* The launch entitlement check asks the store, and in web/mock mode the
   store is this receipt. Seeding app state without it means the check
   correctly concludes there is no subscription and bounces to the paywall. */
const RECEIPT_KEY = 'jojot:receipt:v1'


const iso = (offsetDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const STATE = {
  onboarded: true,
  name: 'Sofia',
  challengeId: 'hard',
  startedISO: iso(-41), // -> day 42
  taskOverrides: {},
  customChallenges: [],
  logs: { 42: { done: ['diet', 'workout', 'water', 'read'], water: 3900, steps: 11204 } },
  entitlement: {
    planId: 'monthly',
    productId: 'jojot.premium.monthly',
    purchasedISO: iso(-11),
    renewsISO: iso(19),
  },
  remindersOn: true,
  shareWithFriends: true,
}

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 430, height: 880 }, acceptDownloads: true })
const page = await ctx.newPage()

for (let i = 0; i < 40; i++) {
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 2000 })
    break
  } catch {
    await new Promise((r) => setTimeout(r, 500))
  }
}

await page.evaluate(([k, v, rk, rv]) => {
  localStorage.setItem(k, v)
  localStorage.setItem(rk, rv)
}, [KEY, JSON.stringify(STATE), RECEIPT_KEY, JSON.stringify(STATE.entitlement)])
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(900)

const button = page.getByRole('button', { name: /share your day/i })
await button.waitFor({ timeout: 5000 })

const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), button.click()])

const path = `${OUT}/share-card.png`
await download.saveAs(path)
console.log(`saved ${path}`)

await browser.close()
