/* ============================================================
   backend.ts — the Supabase client, or the absence of one.

   Same degradation contract as purchases.ts: with no URL/key the
   app is exactly the 1.0 local-only experience — no login surface,
   no friends, nothing half-alive. Callers must handle null.

   The anon key is public by design; it only reaches what RLS
   allows an anonymous or signed-in user to see.
   ============================================================ */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL_ = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || ''
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || ''

let client: SupabaseClient | null = null

export function backendAvailable(): boolean {
  return Boolean(URL_ && KEY)
}

export function supabase(): SupabaseClient | null {
  if (!backendAvailable()) return null
  if (!client) {
    client = createClient(URL_, KEY, {
      auth: {
        // Capacitor WebView persists localStorage; keep sessions there
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
    /* The auto-refresh timer stops ticking while iOS suspends the
       WebView, so after ~1h in the background the access token is
       expired and every query fails RLS ("worked right after update,
       dead an hour later"). Restart the timer and refresh eagerly
       whenever the app comes back to the foreground. */
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!client) return
        if (document.visibilityState === 'visible') {
          client.auth.startAutoRefresh()
          void client.auth.getSession()
        } else {
          client.auth.stopAutoRefresh()
        }
      })
    }
  }
  return client
}
