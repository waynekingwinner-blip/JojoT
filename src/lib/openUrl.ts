/* ============================================================
   openUrl.ts — open an external link, reliably.

   `<a target="_blank">` inside a Capacitor WKWebView is a known
   silent no-op. On the paywall that is not a cosmetic bug: the
   Terms of Use and Privacy Policy links have to actually open, or
   it is a Guideline 3.1.2 rejection.

   Browser.open puts it in an in-app Safari sheet, so the user comes
   straight back to the paywall when they close it.
   ============================================================ */

import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

export async function openUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: 'popover' })
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** onClick handler for an <a> that should go through Browser.open. */
export function linkHandler(url: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault()
    void openUrl(url)
  }
}
