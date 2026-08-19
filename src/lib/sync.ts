/* ============================================================
   sync.ts — local-first sync with the friends backend.

   Local state stays the source of truth for YOUR day (the app
   must work offline, mid-flight, in a basement). The server is a
   mirror friends read from — pushed after every change, and
   backfilled wholesale on first sign-in so a Day-42 streak shows
   up server-side with its history intact (King's requirement:
   old users lose nothing).

   Everything here speaks profile_id, never the Supabase uid.
   ============================================================ */

import { supabase } from './backend'
import { cachedProfileId } from './auth'
import type { Challenge, Task } from './data'
import { cleanShared } from './contentFilter'

type DayLogLike = { done: string[]; water: number; steps: number }

export type ServerTask = { id: string; text: string; done: boolean; done_at: string | null }

function toServerTasks(tasks: Task[], log: DayLogLike, doneAt?: string): ServerTask[] {
  return tasks.map((t) => ({
    id: t.id,
    text: cleanShared(t.text),
    done: log.done.includes(t.id),
    done_at: log.done.includes(t.id) ? (doneAt ?? new Date().toISOString()) : null,
  }))
}

/** The active participation row, created if missing. Idempotent. */
export async function ensureParticipation(
  challenge: Challenge,
  startedISO: string,
): Promise<string | null> {
  const sb = supabase()
  const me = cachedProfileId()
  if (!sb || !me) return null

  const { data: existing } = await sb
    .from('participations')
    .select('id, challenge_key')
    .eq('profile_id', me)
    .eq('is_active', true)
    .maybeSingle()

  if (existing && existing.challenge_key === challenge.id) return existing.id

  // switching challenge: retire the old run, then insert the new one
  if (existing) {
    await sb.from('participations').update({ is_active: false }).eq('id', existing.id)
  }
  const { data, error } = await sb
    .from('participations')
    .insert({
      profile_id: me,
      challenge_key: challenge.id,
      challenge_name: cleanShared(challenge.short),
      total_days: challenge.days,
      started_on: startedISO, // original start date — streak arrives intact
    })
    .select('id')
    .single()
  return error ? null : data.id
}

/** Push one day's state. Upsert keyed on (participation, day) — safe to repeat. */
export async function pushDay(
  participationId: string,
  dayNo: number,
  tasks: Task[],
  log: DayLogLike,
): Promise<boolean> {
  const sb = supabase()
  const me = cachedProfileId()
  if (!sb || !me) return false

  const { error } = await sb.from('day_entries').upsert(
    {
      participation_id: participationId,
      profile_id: me,
      day_no: dayNo,
      tasks: toServerTasks(tasks, log),
      water_ml: log.water,
      steps: log.steps,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'participation_id,day_no' },
  )
  return !error
}

/**
 * First sign-in: mirror the whole local history up. Idempotent,
 * and gap-filling only — a day another device already pushed is
 * never overwritten (1.0 local logs carry no timestamps, so
 * per-day newest-wins is not evaluable; the live day converges
 * through pushDay during normal use).
 */
export async function backfill(
  challenge: Challenge,
  startedISO: string,
  logs: Record<number, DayLogLike>,
  tasks: Task[],
): Promise<{ pushed: number; skipped: number } | null> {
  const sb = supabase()
  const me = cachedProfileId()
  if (!sb || !me) return null

  const pid = await ensureParticipation(challenge, startedISO)
  if (!pid) return null

  // Local 1.0 logs carry no timestamps, so "newest wins" cannot be
  // evaluated per-day. The safe, implementable rule: backfill only
  // fills GAPS — a day another device already pushed is never
  // overwritten. The live day converges through pushDay during use.
  const { data: existing } = await sb
    .from('day_entries')
    .select('day_no')
    .eq('participation_id', pid)
  const alreadyOnServer = new Set((existing ?? []).map((r) => r.day_no))

  let pushed = 0
  let skipped = 0
  for (const [dayStr, log] of Object.entries(logs)) {
    const dayNo = Number(dayStr)
    if (!Number.isInteger(dayNo) || dayNo < 1) continue
    if (alreadyOnServer.has(dayNo)) {
      skipped++
      continue
    }
    if (await pushDay(pid, dayNo, tasks, log)) pushed++
    else skipped++
  }
  return { pushed, skipped }
}

/* ------------------------------------------------------------------ */
/* Friends                                                             */
/* ------------------------------------------------------------------ */

export type FriendToday = {
  profileId: string
  name: string
  challengeName: string
  dayNo: number | null
  tasks: ServerTask[]
}

/** My invite code, to show in the share sheet. The RPC resolves the
    profile server-side, so this works even before the local profile
    cache is warm — it only needs the auth session. */
export async function myInviteCode(): Promise<string | null> {
  const sb = supabase()
  if (!sb) return null
  const { data, error } = await sb.rpc('my_invite_code')
  if (!error && data) return data as string
  const me = cachedProfileId()
  if (!me) return null
  const { data: row } = await sb.from('profiles').select('invite_code').eq('id', me).maybeSingle()
  return row?.invite_code ?? null
}

export async function addFriendByCode(code: string): Promise<'sent' | 'not-found' | 'failed'> {
  const sb = supabase()
  if (!sb) return 'failed'
  const { error } = await sb.rpc('request_friend_by_code', { p_code: code })
  if (!error) return 'sent'
  return /not found/i.test(error.message) ? 'not-found' : 'failed'
}

/** Everyone I can see, with their latest day. RLS does the privacy work. */
export async function fetchFriendsToday(): Promise<FriendToday[]> {
  const sb = supabase()
  const me = cachedProfileId()
  if (!sb || !me) return []

  const { data: profiles } = await sb
    .from('profiles')
    .select('id, display_name')
    .neq('id', me)
  if (!profiles?.length) return []

  const ids = profiles.map((p) => p.id)
  const [{ data: parts }, { data: entries }] = await Promise.all([
    sb.from('participations').select('id, profile_id, challenge_name').eq('is_active', true).in('profile_id', ids),
    sb.from('day_entries').select('profile_id, day_no, tasks').in('profile_id', ids).order('day_no', { ascending: false }),
  ])

  const latestByProfile = new Map<string, { day_no: number; tasks: ServerTask[] }>()
  for (const e of entries ?? []) {
    if (!latestByProfile.has(e.profile_id)) {
      latestByProfile.set(e.profile_id, { day_no: e.day_no, tasks: e.tasks as ServerTask[] })
    }
  }
  const partByProfile = new Map((parts ?? []).map((p) => [p.profile_id, p.challenge_name]))

  return profiles.map((p) => ({
    profileId: p.id,
    name: cleanShared(p.display_name ?? '') || 'Friend',
    challengeName: partByProfile.get(p.id) ?? '—',
    dayNo: latestByProfile.get(p.id)?.day_no ?? null,
    tasks: latestByProfile.get(p.id)?.tasks ?? [],
  }))
}

export type PendingRequest = { friendship_id: string; requester_name: string; requested_at: string }

export async function pendingRequests(): Promise<PendingRequest[]> {
  const sb = supabase()
  if (!sb) return []
  const { data } = await sb.rpc('pending_requests')
  const rows = (data as PendingRequest[]) ?? []
  return rows.map((r) => ({ ...r, requester_name: cleanShared(r.requester_name ?? '') || 'Someone' }))
}

export async function acceptRequest(friendshipId: string): Promise<boolean> {
  const sb = supabase()
  if (!sb) return false
  const { error } = await sb
    .from('friendships')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', friendshipId)
  return !error
}

/** Sever the edge in either direction. RLS limits it to edges I'm on. */
export async function removeFriend(profileId: string): Promise<boolean> {
  const sb = supabase()
  const me = cachedProfileId()
  if (!sb || !me) return false
  const { error } = await sb
    .from('friendships')
    .delete()
    .or(`and(requester.eq.${me},addressee.eq.${profileId}),and(requester.eq.${profileId},addressee.eq.${me})`)
  return !error
}

/** File a report (lands in the reports table + support inbox) and cut the tie. */
export async function reportFriend(profileId: string, reason: string): Promise<boolean> {
  const sb = supabase()
  const me = cachedProfileId()
  if (!sb || !me) return false
  const { error } = await sb.from('reports').insert({
    reporter: me,
    reported: profileId,
    reason: reason.slice(0, 500),
  })
  if (error) return false
  await removeFriend(profileId) // reporting implies you no longer want to see them
  return true
}

/** Live updates: friend ticks a task → callback fires. Returns unsubscribe. */
export function subscribeFriendEntries(onChange: () => void): () => void {
  const sb = supabase()
  if (!sb) return () => {}
  const channel = sb
    .channel('friend-day-entries')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'day_entries' }, onChange)
    .subscribe()
  return () => {
    void sb.removeChannel(channel)
  }
}
