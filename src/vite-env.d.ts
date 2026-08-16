/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * RevenueCat public SDK key for the App Store app (starts `appl_`).
   * Public by design — it is meant to ship inside the client, and it
   * is not the secret key (`sk_`), which must never reach this repo.
   *
   * Set it in `.env.local` (gitignored) or in the build environment.
   * Absent on a native build, the paywall reports subscriptions as
   * unavailable rather than showing invented prices or giving the
   * app away — see purchaseMode() in src/lib/purchases.ts.
   */
  readonly VITE_REVENUECAT_IOS_KEY?: string
  /** '1' on TestFlight builds only — unlocks the paywall when the
      store has no products yet (pre-1.0-approval deadlock). */
  readonly VITE_BETA_UNLOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
