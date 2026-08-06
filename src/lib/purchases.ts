/* ============================================================
   purchases.ts — subscription catalogue + a mock store client.

   Prices, product ids and renewal terms mirror the live App Store
   listing (Premium Weekly $7.99 / Monthly $14.99 / Yearly $49.99).

   `buy()` / `restore()` are the two seams a real StoreKit or
   Google Play Billing plugin plugs into — swap the bodies for
   `Purchases.purchasePackage(...)` etc. and the UI is unchanged.
   ============================================================ */

export type PlanId = 'weekly' | 'monthly' | 'yearly'

export type Plan = {
  id: PlanId
  productId: string
  title: string
  price: string
  /** unit price line under the title */
  per: string
  /** right-hand equivalent, e.g. "$4.16 / month" */
  equivalent: string
  badge?: string
  /** renewal period in days, used to date the next charge */
  periodDays: number
}

export const PLANS: Plan[] = [
  {
    id: 'weekly',
    productId: 'jojot.premium.weekly',
    title: 'Weekly',
    price: '$7.99',
    per: '$7.99 per week',
    equivalent: '$1.14 / day',
    periodDays: 7,
  },
  {
    id: 'monthly',
    productId: 'jojot.premium.monthly',
    title: 'Monthly',
    price: '$14.99',
    per: '$14.99 per month',
    equivalent: '$3.75 / week',
    badge: 'Most popular',
    periodDays: 30,
  },
  {
    id: 'yearly',
    productId: 'jojot.premium.yearly',
    title: 'Yearly',
    price: '$49.99',
    per: '$49.99 per year',
    equivalent: '$4.16 / month',
    badge: 'Save 72%',
    periodDays: 365,
  },
]

export const DEFAULT_PLAN: PlanId = 'monthly'

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[1]
}

export type Entitlement = {
  planId: PlanId
  productId: string
  /** ISO date the subscription was purchased */
  purchasedISO: string
  /** ISO date the subscription auto-renews */
  renewsISO: string
}

export type PurchaseResult =
  | { ok: true; entitlement: Entitlement }
  | { ok: false; reason: 'cancelled' | 'failed' | 'none-to-restore' }

const LATENCY = 850

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function entitlementFor(plan: Plan): Entitlement {
  const today = new Date().toISOString().slice(0, 10)
  return {
    planId: plan.id,
    productId: plan.productId,
    purchasedISO: today,
    renewsISO: addDays(today, plan.periodDays),
  }
}

/** Where a native plugin would record the receipt. */
const RECEIPT_KEY = 'jojot:receipt:v1'

function writeReceipt(e: Entitlement) {
  try {
    localStorage.setItem(RECEIPT_KEY, JSON.stringify(e))
  } catch {
    /* ignore */
  }
}

function readReceipt(): Entitlement | null {
  try {
    const raw = localStorage.getItem(RECEIPT_KEY)
    return raw ? (JSON.parse(raw) as Entitlement) : null
  } catch {
    return null
  }
}

export function clearReceipt() {
  try {
    localStorage.removeItem(RECEIPT_KEY)
  } catch {
    /* ignore */
  }
}

/** Present the platform purchase sheet and unlock on success. */
export async function buy(planId: PlanId): Promise<PurchaseResult> {
  const plan = getPlan(planId)
  await new Promise((r) => setTimeout(r, LATENCY))
  const entitlement = entitlementFor(plan)
  writeReceipt(entitlement)
  return { ok: true, entitlement }
}

/** Re-read the receipt from the store (App Store "Restore Purchases"). */
export async function restore(): Promise<PurchaseResult> {
  await new Promise((r) => setTimeout(r, LATENCY))
  const found = readReceipt()
  if (!found) return { ok: false, reason: 'none-to-restore' }
  return { ok: true, entitlement: found }
}

export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
export const PRIVACY_URL = 'https://www.apple.com/legal/privacy/'
