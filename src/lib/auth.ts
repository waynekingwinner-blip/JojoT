/* ============================================================
   auth.ts — Sign in with Apple → Supabase session → our profile.

   The nonce dance, because it is easy to get backwards:
     1. generate a random RAW nonce
     2. hand Apple the SHA-256 of it (that is what goes inside the
        identity token)
     3. hand Supabase the RAW one — it hashes and compares
   Get it backwards and sign-in fails with a nonce mismatch.

   Identity rule (notes/ARCHITECTURE-auth.md): after the Supabase
   session exists we immediately call ensure_profile(), and from
   then on the app only ever speaks profile_id — never the
   Supabase uid. Apple's stable `sub` is what lets a reinstalled
   user get their history back.
   ============================================================ */

import { Capacitor } from '@capacitor/core'
import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { supabase, backendAvailable } from './backend'

export type SignInResult =
  | { ok: true; profileId: string }
  | { ok: false; reason: 'cancelled' | 'unavailable' | 'failed' }

const PROFILE_KEY = 'jojot:profile:v1'

export function cachedProfileId(): string | null {
  try {
    return localStorage.getItem(PROFILE_KEY)
  } catch {
    return null
  }
}

function rememberProfileId(id: string | null) {
  try {
    if (id) localStorage.setItem(PROFILE_KEY, id)
    else localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* ignore */
  }
}

function randomNonce(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Apple's stable user id, straight out of the identity token. */
function subjectFromIdToken(idToken: string): string | null {
  try {
    const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

export async function signInWithApple(displayName: string): Promise<SignInResult> {
  const sb = supabase()
  if (!sb || !Capacitor.isNativePlatform()) return { ok: false, reason: 'unavailable' }

  const rawNonce = randomNonce()

  let idToken: string
  try {
    const res = await SignInWithApple.authorize({
      clientId: 'com.jojot.app',
      redirectURI: '', // unused for the native flow
      scopes: 'name',
      nonce: await sha256Hex(rawNonce),
    })
    if (!res.response?.identityToken) return { ok: false, reason: 'cancelled' }
    idToken = res.response.identityToken
  } catch {
    // the native sheet rejects on user cancel as well
    return { ok: false, reason: 'cancelled' }
  }

  const { error } = await sb.auth.signInWithIdToken({
    provider: 'apple',
    token: idToken,
    nonce: rawNonce,
  })
  if (error) return { ok: false, reason: 'failed' }

  const sub = subjectFromIdToken(idToken)
  if (!sub) return { ok: false, reason: 'failed' }

  const { data, error: rpcError } = await sb.rpc('ensure_profile', {
    p_provider: 'apple',
    p_subject: sub,
    p_name: displayName || null,
  })
  if (rpcError || !data) return { ok: false, reason: 'failed' }

  rememberProfileId(data as string)
  return { ok: true, profileId: data as string }
}

/** Restore an existing session on launch; resolves the profile id. */
export async function restoreSession(): Promise<string | null> {
  const sb = supabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  if (!data.session) {
    rememberProfileId(null)
    return null
  }
  const cached = cachedProfileId()
  if (cached) return cached
  // Session but no cached profile (e.g. cleared storage). ensure_profile
  // short-circuits on the existing auth_link; the subject is only used
  // if that link is somehow missing, so pass the REAL Apple sub from the
  // session rather than a junk value that could mint an empty profile.
  const sub = data.session.user.identities?.[0]?.id
  if (!sub) return null
  const { data: pid } = await sb.rpc('ensure_profile', {
    p_provider: 'apple',
    p_subject: sub,
    p_name: null,
  })
  if (pid) rememberProfileId(pid as string)
  return (pid as string) ?? null
}

export async function signOut(): Promise<void> {
  const sb = supabase()
  rememberProfileId(null)
  if (sb) await sb.auth.signOut()
}
