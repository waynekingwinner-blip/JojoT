/* ============================================================
   store.tsx — global app state with localStorage persistence.
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CHALLENGES, type Challenge, type Task, type TaskKind } from './data'
import { checkEntitlement, clearReceipt, purchaseMode, type Entitlement } from './purchases'
import { deletePhoto } from './photos'
import { backendAvailable } from './backend'
import { cachedProfileId, restoreSession, signInWithApple, signOut } from './auth'
import { backfill, ensureParticipation, pushDay } from './sync'

const KEY = 'jojot:state:v1'

export type Tab = 'today' | 'hydrate' | 'friends' | 'profile'

type DayLog = {
  /** completed task ids */
  done: string[]
  /** ml drunk */
  water: number
  /** steps walked */
  steps: number
  /** progress photo: a tone string (placeholder) or a data URL */
  photo?: string
}

type Persisted = {
  onboarded: boolean
  name: string
  /** null until a challenge is chosen */
  challengeId: string | null
  /** ISO date (yyyy-mm-dd) day 1 started */
  startedISO: string | null
  /** per-challenge task overrides — customised to-do lists */
  taskOverrides: Record<string, Task[]>
  /** user-authored challenges */
  customChallenges: Challenge[]
  /** day number -> log */
  logs: Record<number, DayLog>
  /** active subscription, null when free */
  entitlement: Entitlement | null
  remindersOn: boolean
  shareWithFriends: boolean
}

const EMPTY_DAY: DayLog = { done: [], water: 0, steps: 0 }

const DEFAULT: Persisted = {
  onboarded: false,
  name: '',
  challengeId: null,
  startedISO: null,
  taskOverrides: {},
  customChallenges: [],
  logs: {},
  entitlement: null,
  remindersOn: true,
  shareWithFriends: true,
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Persisted>) }
  } catch {
    /* ignore */
  }
  return DEFAULT
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Whole days between two yyyy-mm-dd dates. */
function daysBetween(fromISO: string, toISO: string): number {
  const a = Date.parse(`${fromISO}T00:00:00Z`)
  const b = Date.parse(`${toISO}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86_400_000)
}

type Ctx = {
  state: Persisted
  /** the active challenge, with any task customisation applied */
  challenge: Challenge | null
  /** every challenge the user can pick, presets + custom */
  allChallenges: Challenge[]
  /** calendar day of the challenge (1-based, clamped to length) */
  currentDay: number
  /** the day being viewed — usually currentDay, may be an earlier day */
  viewDay: number
  setViewDay: (d: number) => void
  /** log for viewDay */
  log: DayLog
  isPremium: boolean
  /** false until the store has been asked. The gate must not render
      a decision before this flips, or real subscribers get a flash
      of the paywall on every cold start. Not persisted. */
  premiumChecked: boolean
  waterGoalMl: number

  finishOnboarding: (name: string) => void
  setName: (n: string) => void
  startChallenge: (id: string) => void
  leaveChallenge: () => void

  toggleTask: (taskId: string) => void
  addWater: (ml: number) => void
  setWater: (ml: number) => void
  addSteps: (n: number) => void
  setSteps: (n: number) => void
  savePhoto: (tone: string) => void

  addTask: (text: string, kind?: TaskKind) => void
  updateTask: (taskId: string, text: string) => void
  removeTask: (taskId: string) => void
  resetTasks: () => void
  createChallenge: (input: { name: string; days: number; tasks: string[] }) => string

  /** null = 未登录。好友功能的开关。 */
  profileId: string | null
  socialAvailable: boolean
  signIn: () => Promise<'ok' | 'cancelled' | 'failed'>
  signOutSocial: () => Promise<void>

  setEntitlement: (e: Entitlement | null) => void
  cancelSubscription: () => void
  setReminders: (on: boolean) => void
  setShare: (on: boolean) => void
  resetAll: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load)
  const [viewDayRaw, setViewDayRaw] = useState<number | null>(null)
  const [premiumChecked, setPremiumChecked] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(cachedProfileId())

  // 恢复已有登录会话(无会话则安静返回,绝不弹任何框)
  useEffect(() => {
    if (!backendAvailable()) return
    void restoreSession().then((pid) => setProfileId(pid))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  // Ask the store who this user is, once, on launch. Persisted
  // entitlement is only a cache — the store is the authority, so a
  // lapsed or refunded subscription closes the gate again, and a
  // reinstall opens it without the user hunting for Restore.
  useEffect(() => {
    let live = true
    void checkEntitlement()
      .then((result) => {
        if (!live || result.status !== 'ok') return // 'unknown' → keep the cache
        const found = result.entitlement
        setState((s) => (sameEntitlement(s.entitlement, found) ? s : { ...s, entitlement: found }))
      })
      .finally(() => {
        if (live) setPremiumChecked(true)
      })
    return () => {
      live = false
    }
  }, [])

  const allChallenges = useMemo(
    () => [...state.customChallenges, ...CHALLENGES],
    [state.customChallenges],
  )

  const challenge = useMemo(() => {
    const base = allChallenges.find((c) => c.id === state.challengeId) ?? null
    if (!base) return null
    const override = state.taskOverrides[base.id]
    return override ? { ...base, tasks: override } : base
  }, [allChallenges, state.challengeId, state.taskOverrides])

  const currentDay = useMemo(() => {
    if (!challenge || !state.startedISO) return 1
    const elapsed = daysBetween(state.startedISO, todayISO())
    return Math.min(challenge.days, Math.max(1, elapsed + 1))
  }, [challenge, state.startedISO])

  const viewDay = viewDayRaw == null ? currentDay : Math.min(currentDay, Math.max(1, viewDayRaw))
  const log = state.logs[viewDay] ?? EMPTY_DAY
  const isPremium = state.entitlement != null
  const waterGoalMl = challenge?.waterGoalMl ?? 3000

  // Hitting the water goal ticks the water task off automatically.
  useEffect(() => {
    if (!challenge) return
    const waterTask = challenge.tasks.find((t) => t.kind === 'water')
    if (!waterTask) return
    if (log.water < waterGoalMl) return
    if (log.done.includes(waterTask.id)) return
    setState((s) => {
      const prev = s.logs[viewDay] ?? EMPTY_DAY
      if (prev.done.includes(waterTask.id)) return s
      return { ...s, logs: { ...s.logs, [viewDay]: { ...prev, done: [...prev.done, waterTask.id] } } }
    })
  }, [challenge, log.water, log.done, waterGoalMl, viewDay])

  // 登录后,当天数据每次变化都镜像到服务器(防抖 1.5s,离线失败无感)
  useEffect(() => {
    if (!profileId || !challenge || !state.startedISO) return
    const t = setTimeout(() => {
      void ensureParticipation(challenge, state.startedISO!).then((pid) => {
        if (pid) void pushDay(pid, viewDay, challenge.tasks, log)
      })
    }, 1500)
    return () => clearTimeout(t)
  }, [profileId, challenge, state.startedISO, viewDay, log])

  /** Patch the log for the day currently being viewed. */
  const patchLog = useCallback(
    (fn: (d: DayLog) => DayLog) => {
      setState((s) => {
        const day = viewDayRaw == null ? currentDayOf(s) : viewDayRaw
        const prev = s.logs[day] ?? EMPTY_DAY
        return { ...s, logs: { ...s.logs, [day]: fn(prev) } }
      })
    },
    [viewDayRaw],
  )

  /** Task list currently in effect for the active challenge. */
  const currentTasks = useCallback((s: Persisted): Task[] => {
    const base = [...s.customChallenges, ...CHALLENGES].find((c) => c.id === s.challengeId)
    if (!base) return []
    return s.taskOverrides[base.id] ?? base.tasks
  }, [])

  const value: Ctx = {
    state,
    challenge,
    allChallenges,
    currentDay,
    viewDay,
    setViewDay: (d) => setViewDayRaw(d),
    log,
    isPremium,
    premiumChecked,
    waterGoalMl,

    finishOnboarding: (name) =>
      setState((s) => ({ ...s, onboarded: true, name: name.trim() || s.name })),
    setName: (n) => setState((s) => ({ ...s, name: n })),

    startChallenge: (id) =>
      setState((s) => ({
        ...s,
        challengeId: id,
        // keep the original start date when re-joining the same challenge
        startedISO: s.challengeId === id && s.startedISO ? s.startedISO : todayISO(),
        logs: s.challengeId === id ? s.logs : {},
      })),
    leaveChallenge: () =>
      setState((s) => ({ ...s, challengeId: null, startedISO: null, logs: {} })),

    toggleTask: (taskId) =>
      patchLog((d) => ({
        ...d,
        done: d.done.includes(taskId) ? d.done.filter((t) => t !== taskId) : [...d.done, taskId],
      })),

    addWater: (ml) =>
      patchLog((d) => ({ ...d, water: Math.max(0, d.water + ml) })),
    setWater: (ml) => patchLog((d) => ({ ...d, water: Math.max(0, ml) })),
    addSteps: (n) => patchLog((d) => ({ ...d, steps: Math.max(0, d.steps + n) })),
    setSteps: (n) => patchLog((d) => ({ ...d, steps: Math.max(0, n) })),
    savePhoto: (tone) => patchLog((d) => ({ ...d, photo: tone })),

    addTask: (text, kind = 'check') =>
      setState((s) => {
        if (!s.challengeId) return s
        const tasks = currentTasks(s)
        const id = `t${Date.now().toString(36)}`
        return {
          ...s,
          taskOverrides: { ...s.taskOverrides, [s.challengeId]: [...tasks, { id, text, kind }] },
        }
      }),

    updateTask: (taskId, text) =>
      setState((s) => {
        if (!s.challengeId) return s
        const tasks = currentTasks(s).map((t) => (t.id === taskId ? { ...t, text } : t))
        return { ...s, taskOverrides: { ...s.taskOverrides, [s.challengeId]: tasks } }
      }),

    removeTask: (taskId) =>
      setState((s) => {
        if (!s.challengeId) return s
        const tasks = currentTasks(s).filter((t) => t.id !== taskId)
        return { ...s, taskOverrides: { ...s.taskOverrides, [s.challengeId]: tasks } }
      }),

    resetTasks: () =>
      setState((s) => {
        if (!s.challengeId) return s
        const next = { ...s.taskOverrides }
        delete next[s.challengeId]
        return { ...s, taskOverrides: next }
      }),

    createChallenge: ({ name, days, tasks }) => {
      const id = `custom-${Date.now().toString(36)}`
      const challengeTasks: Task[] = tasks.map((text, i) => ({
        id: `c${i}`,
        text,
        kind: /water/i.test(text) ? 'water' : /step/i.test(text) ? 'steps' : /pic|photo/i.test(text) ? 'photo' : 'check',
        ...(/step/i.test(text) ? { steps: 10000 } : {}),
      }))
      const created: Challenge = {
        id,
        name,
        short: name,
        tagline: 'your own challenge',
        days,
        intensity: 'medium',
        joined: 1,
        waterGoalMl: 3000,
        tones: ['#d6d6d6', '#e6e6e6', '#c4c4c4', '#efefef'],
        tasks: challengeTasks,
        custom: true,
      }
      setState((s) => ({ ...s, customChallenges: [created, ...s.customChallenges] }))
      return id
    },

    profileId,
    socialAvailable: backendAvailable(),

    signIn: async () => {
      const res = await signInWithApple(state.name)
      if (!res.ok) return res.reason === 'cancelled' ? 'cancelled' : 'failed'
      setProfileId(res.profileId)
      // 老用户历史整体回填(只填空缺,幂等)
      if (challenge && state.startedISO) {
        void backfill(challenge, state.startedISO, state.logs, challenge.tasks)
      }
      return 'ok'
    },

    signOutSocial: async () => {
      await signOut()
      setProfileId(null)
    },

    setEntitlement: (e) => setState((s) => ({ ...s, entitlement: e })),

    // Only the mock can "cancel" anything. Against the real store,
    // clearing local state would let someone believe they had
    // unsubscribed while Apple kept billing them — and RevenueCat
    // would hand the entitlement straight back on next launch.
    // Cancelling lives in iOS Settings; the UI sends them there.
    cancelSubscription: () => {
      if (purchaseMode() !== 'mock') return
      clearReceipt()
      setState((s) => ({ ...s, entitlement: null }))
    },
    setReminders: (on) => setState((s) => ({ ...s, remindersOn: on })),
    setShare: (on) => setState((s) => ({ ...s, shareWithFriends: on })),
    resetAll: () => {
      clearReceipt()
      // a reset should really take the pictures with it, not just forget them
      for (const day of Object.values(state.logs)) {
        if (day.photo) void deletePhoto(day.photo)
      }
      setViewDayRaw(null)
      setState(DEFAULT)
    },
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

/** Avoids a pointless state write — and the re-render it causes —
    when the store confirms exactly what was already cached. */
function sameEntitlement(a: Entitlement | null, b: Entitlement | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.productId === b.productId && a.renewsISO === b.renewsISO
}

/** currentDay computed from a raw state snapshot (used inside setState). */
function currentDayOf(s: Persisted): number {
  const base = [...s.customChallenges, ...CHALLENGES].find((c) => c.id === s.challengeId)
  if (!base || !s.startedISO) return 1
  const elapsed = daysBetween(s.startedISO, todayISO())
  return Math.min(base.days, Math.max(1, elapsed + 1))
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
