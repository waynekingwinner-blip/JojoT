/* End-to-end click-through: fresh install → onboarding → paywall → challenge → daily use.
   Run against `npx vite preview --port 4173`. Fails loudly if anything is dead. */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4173'
const KEY = 'jojot:state:v1'
const FAIL_DIR = process.env.FAIL_DIR || 'e2e-failures'

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 430, height: 880 },
  deviceScaleFactor: 2,
  acceptDownloads: true, // the share card comes back as a download on web
})
const page = await ctx.newPage()

const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

const steps = []
const ok = (label) => {
  steps.push(`  ok  ${label}`)
  console.log(`  ok  ${label}`)
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const check = async (label, fn) => {
  try {
    await fn()
    ok(label)
  } catch (e) {
    console.error(`FAIL  ${label}\n      ${e.message.split('\n')[0]}`)
    // a screenshot of the moment it broke beats guessing at the selector
    const shot = `${FAIL_DIR}/${slug(label)}.png`
    try {
      mkdirSync(FAIL_DIR, { recursive: true })
      await page.screenshot({ path: shot, fullPage: true })
      console.error(`      → ${shot}`)
    } catch {
      /* screenshot is best-effort */
    }
    steps.push(`FAIL  ${label}`)
    process.exitCode = 1
  }
}
const wait = (ms) => page.waitForTimeout(ms)
const state = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), KEY)

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate((k) => localStorage.removeItem(k), KEY)
await page.reload({ waitUntil: 'networkidle' })
await wait(700)

console.log('\n— onboarding —')
await check('slide 1 renders', async () => {
  await page.getByText('Keep the').first().waitFor({ timeout: 3000 })
})
await check('Next advances slides', async () => {
  await page.getByRole('button', { name: 'Next' }).click()
  await wait(500)
  await page.getByText('every day', { exact: false }).first().waitFor({ timeout: 3000 })
})
await check('Get started opens the name field', async () => {
  await page.getByRole('button', { name: 'Next' }).click()
  await wait(500)
  await page.getByRole('button', { name: 'Get started' }).click()
  await wait(500)
  await page.getByPlaceholder('Your name').waitFor({ timeout: 3000 })
})
await check('Continue is disabled until a name is typed', async () => {
  const btn = page.getByRole('button', { name: 'Continue' })
  if (!(await btn.isDisabled())) throw new Error('Continue was enabled with an empty name')
  await page.getByPlaceholder('Your name').fill('Jojo')
  await wait(300)
  if (await btn.isDisabled()) throw new Error('Continue stayed disabled after typing')
})
await check('name is persisted', async () => {
  await page.getByRole('button', { name: 'Continue' }).click()
  await wait(700)
  const s = await state()
  if (s.name !== 'Jojo' || !s.onboarded) throw new Error(`bad state ${JSON.stringify(s)}`)
})

console.log('\n— paywall —')
await check('paywall is the hard gate after onboarding', async () => {
  await page.getByText('Keep the').first().waitFor({ timeout: 3000 })
  await page.getByText('Restore Purchases').waitFor({ timeout: 3000 })
})
await check('all three tiers show App Store prices', async () => {
  for (const [tier, price] of [['Weekly', '$7.99'], ['Monthly', '$14.99'], ['Yearly', '$49.99']]) {
    await page.getByText(tier, { exact: true }).waitFor({ timeout: 2000 })
    await page.getByText(price, { exact: true }).first().waitFor({ timeout: 2000 })
  }
})
await check('monthly is preselected and CTA reflects it', async () => {
  await page.getByRole('button', { name: /Continue — \$14\.99\/mo/ }).waitFor({ timeout: 2000 })
})
await check('selecting yearly updates the CTA and legal copy', async () => {
  await page.getByText('Yearly', { exact: true }).click()
  await wait(400)
  await page.getByRole('button', { name: /Continue — \$49\.99\/yr/ }).waitFor({ timeout: 2000 })
  await page.getByText('$49.99 per year, auto-renewing', { exact: false }).waitFor({ timeout: 2000 })
})
await check('restore with no receipt reports it', async () => {
  await page.getByText('Restore Purchases').click()
  await wait(1400)
  await page.getByText('No previous purchase found', { exact: false }).waitFor({ timeout: 3000 })
  await wait(2700)
})
await check('purchase unlocks the app and records an entitlement', async () => {
  await page.getByText('Weekly', { exact: true }).click()
  await wait(300)
  await page.getByRole('button', { name: /Continue — \$7\.99\/wk/ }).click()
  await wait(1600)
  const s = await state()
  if (s.entitlement?.planId !== 'weekly') throw new Error(`no weekly entitlement: ${JSON.stringify(s.entitlement)}`)
  if (!s.entitlement.renewsISO) throw new Error('no renewal date')
})

console.log('\n— choosing a challenge —')
await check('challenge list renders', async () => {
  await page.getByText('soft, medium, hard, better me…').waitFor({ timeout: 3000 })
  for (const name of ['75 Strict', '75 Medium', '75 Soft', 'Glow Within', 'Better Me', 'Sugar Free', 'Mental Wellness']) {
    await page.getByText(name, { exact: true }).first().waitFor({ timeout: 3000 })
  }
})
await check('challenge detail shows rules + joined count', async () => {
  await page.getByText('75 Strict', { exact: true }).first().click()
  await wait(700)
  await page.getByText('+6,256 joined').waitFor({ timeout: 3000 })
  await page.getByText('Take a progress picture every day').waitFor({ timeout: 3000 })
})
await check('starting the challenge lands on Today at day 1', async () => {
  await page.getByRole('button', { name: /Start 75 Strict/ }).click()
  await wait(1000)
  await page.getByText('Day 1', { exact: true }).waitFor({ timeout: 3000 })
  const s = await state()
  if (s.challengeId !== 'hard' || !s.startedISO) throw new Error(`bad challenge state ${JSON.stringify(s)}`)
})

console.log('\n— daily use —')
await check('ticking a task persists', async () => {
  await page.locator('.check').first().click()
  await wait(500)
  const s = await state()
  if (!s.logs?.[1]?.done?.includes('diet')) throw new Error(`task not logged: ${JSON.stringify(s.logs)}`)
})
await check('water tab adds water and updates the readout', async () => {
  await page.locator('.tab').nth(1).click()
  await wait(700)
  await page.locator('.btn.water').click()
  await wait(500)
  await page.getByText('250ml', { exact: true }).waitFor({ timeout: 2000 })
  await page.getByText('+750').click()
  await wait(500)
  await page.getByText('1000ml', { exact: true }).waitFor({ timeout: 2000 })
})
await check('hitting the goal auto-ticks the water task', async () => {
  await page.evaluate(
    ([k]) => {
      const s = JSON.parse(localStorage.getItem(k))
      s.logs[1].water = 3785
      localStorage.setItem(k, JSON.stringify(s))
    },
    [KEY],
  )
  await page.reload({ waitUntil: 'networkidle' })
  await wait(1000)
  const s = await state()
  if (!s.logs[1].done.includes('water')) throw new Error('water task did not auto-complete')
})
await check('editing the list adds a custom task', async () => {
  await page.locator('.tab').nth(0).click()
  await wait(700)
  await page.getByRole('button', { name: 'Edit list' }).click()
  await wait(400)
  await page.getByPlaceholder('Add your own task').fill('Cold plunge')
  await page.getByRole('button', { name: 'Add task' }).click()
  await wait(500)
  const s = await state()
  const tasks = s.taskOverrides?.hard ?? []
  if (!tasks.some((t) => t.text === 'Cold plunge')) throw new Error('custom task not saved')
})
await check('removing a task works', async () => {
  const before = (await state()).taskOverrides.hard.length
  await page.getByRole('button', { name: 'Remove task' }).first().click()
  await wait(600)
  const after = (await state()).taskOverrides.hard.length
  if (after !== before - 1) throw new Error(`expected ${before - 1} tasks, got ${after}`)
  await page.getByRole('button', { name: 'Done editing' }).click()
  await wait(400)
})
// The capture itself goes through the native camera, so it can only be
// exercised on a device. What is checkable here is that the sheet offers
// both real routes in and no longer fakes a picture with a colour swatch.
await check('progress picture sheet offers camera and library', async () => {
  await page.getByRole('button', { name: 'Take progress picture' }).click()
  await wait(700)
  await page.getByRole('button', { name: /Take a picture/ }).waitFor({ timeout: 3000 })
  await page.getByRole('button', { name: /Choose from library/ }).waitFor({ timeout: 3000 })
  await page.getByRole('button', { name: 'Cancel' }).click()
  await wait(500)
})

await check('share card downloads with the day on it', async () => {
  const button = page.getByRole('button', { name: /Share your day/ })
  await button.waitFor({ timeout: 3000 })
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    button.click(),
  ])
  if (!/jojot-day-\d+\.png/.test(download.suggestedFilename())) {
    throw new Error(`unexpected card filename: ${download.suggestedFilename()}`)
  }
})

console.log('\n— you —')
await check('profile shows the active subscription', async () => {
  await page.locator('.tab').nth(3).click()
  await wait(800)
  await page.getByText('JojoT Premium · Weekly').waitFor({ timeout: 3000 })
  await page.getByText('Active', { exact: true }).waitFor({ timeout: 3000 })
})
await check('settings toggles persist', async () => {
  await page.locator('.scroll').last().evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
  await wait(600)
  const toggles = page.locator('[role="switch"]')
  await toggles.nth(1).click() // reminders
  await wait(500)
  const s = await state()
  if (s.remindersOn !== false) throw new Error('reminders toggle did not persist')
})
await check('cancelling the subscription drops back to the paywall', async () => {
  await page.locator('.scroll').last().evaluate((el) => el.scrollTo({ top: 0 }))
  await wait(500)
  await page.locator('.link-btn', { hasText: 'Cancel subscription' }).click()
  await wait(700)
  await page.locator('.sheet .btn', { hasText: 'Cancel subscription' }).click()
  await wait(1000)
  await page.getByText('Restore Purchases').waitFor({ timeout: 3000 })
  const s = await state()
  if (s.entitlement !== null) throw new Error('entitlement not cleared')
})
await check('re-subscribing after cancelling gets you back in', async () => {
  await page.getByRole('button', { name: /Continue — \$14\.99\/mo/ }).click()
  await wait(1600)
  // you return to the tab you were on (You), so hop back to Today
  await page.locator('.tab').nth(0).click()
  await wait(700)
  await page.getByText('Day 1', { exact: true }).waitFor({ timeout: 3000 })
})
// The launch entitlement check asks the store directly, so a user whose
// local state was lost is let straight back in — no paywall flash, and
// no hunting for a Restore button. The manual Restore path is covered
// above, by the case where the store has nothing to give back.
await check('a lost local entitlement is recovered from the store on launch', async () => {
  // wipe app state but leave the store receipt, as a fresh install would
  await page.evaluate(
    ([k]) => {
      const s = JSON.parse(localStorage.getItem(k))
      s.entitlement = null
      localStorage.setItem(k, JSON.stringify(s))
    },
    [KEY],
  )
  await page.reload({ waitUntil: 'networkidle' })
  await wait(1600)
  if (await page.getByText('Restore Purchases').isVisible().catch(() => false)) {
    throw new Error('paywall was shown to a subscriber instead of silently recovering')
  }
  await page.getByText('Day 1', { exact: true }).waitFor({ timeout: 3000 })
  const s = await state()
  if (s.entitlement?.planId !== 'monthly') throw new Error('restore did not reinstate the plan')
})

console.log('\n— custom challenge —')
await check('a user-built challenge can be created and started', async () => {
  await page.evaluate(
    ([k]) => {
      const s = JSON.parse(localStorage.getItem(k))
      s.challengeId = null
      s.startedISO = null
      localStorage.setItem(k, JSON.stringify(s))
    },
    [KEY],
  )
  await page.reload({ waitUntil: 'networkidle' })
  await wait(900)
  await page.getByText('Create your own').click()
  await wait(600)
  await page.getByPlaceholder('e.g. 60 Day Reset').fill('30 Day Reset')
  await page.getByText('30', { exact: true }).click()
  await page.getByText('+ Drink 3 L of water').click()
  await wait(300)
  await page.getByPlaceholder('Add a daily task').fill('Journal at night')
  await page.keyboard.press('Enter')
  await wait(400)
  await page.getByRole('button', { name: 'Create challenge' }).click()
  await wait(800)
  await page.getByRole('button', { name: /Start 30 Day Reset/ }).click()
  await wait(900)
  await page.getByText('30 Day Reset').first().waitFor({ timeout: 3000 })
  const s = await state()
  if (!s.customChallenges?.length) throw new Error('custom challenge not saved')
  if (s.customChallenges[0].days !== 30) throw new Error(`expected 30 days, got ${s.customChallenges[0].days}`)
})

console.log('\n———')
if (errors.length) {
  console.error(`\n${errors.length} runtime error(s):`)
  errors.forEach((e) => console.error(`  ${e}`))
  process.exitCode = 1
} else {
  console.log('no runtime errors')
}
const failed = steps.filter((s) => s.startsWith('FAIL')).length
console.log(`${steps.length - failed}/${steps.length} checks passed`)

await browser.close()
