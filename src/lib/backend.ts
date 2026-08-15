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
  }
  return client
}
