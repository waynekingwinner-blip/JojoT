/* ============================================================
   data.ts — challenge presets and inspiration boards.

   Task `kind` drives how a row behaves on the Today screen:
     check  — plain tick
     water  — tick + live "1,4 / 3 L" readout, links to Hydrate
     steps  — tick + live "10,001 steps today" readout
     photo  — tick + opens the progress-photo capture sheet
   ============================================================ */

export type TaskKind = 'check' | 'water' | 'steps' | 'photo'

export type Task = {
  id: string
  text: string
  kind: TaskKind
  /** steps target (kind: 'steps') */
  steps?: number
}

export type Challenge = {
  id: string
  name: string
  /** short label used on cards / chips */
  short: string
  tagline: string
  days: number
  intensity: 'soft' | 'medium' | 'hard'
  joined: number
  /** ml of water per day for this challenge */
  waterGoalMl: number
  /** 4 mood-board tones — rendered as abstract tiles */
  tones: string[]
  tasks: Task[]
  /** true for user-created challenges */
  custom?: boolean
}

/** Mood-board palettes — pure greys. Each challenge gets its own
    lightness range so the cards still read as distinct. */
const MOOD = {
  hard: ['#2b2b2b', '#6b6b6b', '#4a4a4a', '#8f8f8f'],
  medium: ['#8a8a8a', '#b6b6b6', '#9e9e9e', '#cfcfcf'],
  soft: ['#c6c6c6', '#e2e2e2', '#d4d4d4', '#efefef'],
  glow: ['#b0b0b0', '#d8d8d8', '#c2c2c2', '#e8e8e8'],
  better: ['#9a9a9a', '#c8c8c8', '#aeaeae', '#dcdcdc'],
  sugar: ['#bcbcbc', '#e0e0e0', '#a4a4a4', '#ededed'],
  mental: ['#d0d0d0', '#eaeaea', '#bebebe', '#f4f4f4'],
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'hard',
    name: '75 Day Hard',
    short: '75 Hard',
    tagline: 'no compromises, no excuses',
    days: 75,
    intensity: 'hard',
    joined: 6256,
    waterGoalMl: 3785, // 1 US gallon
    tones: MOOD.hard,
    tasks: [
      { id: 'diet', text: 'Follow a strict diet (no cheat meals, no alcohol)', kind: 'check' },
      { id: 'workout', text: 'Do two 45-minute workouts per day, one must be outside', kind: 'check' },
      { id: 'water', text: 'Drink 1 gallon of water', kind: 'water' },
      { id: 'read', text: 'Read 10 pages of a non-fiction/self-development book', kind: 'check' },
      { id: 'photo', text: 'Take a progress picture every day', kind: 'photo' },
    ],
  },
  {
    id: 'medium',
    name: '75 Medium',
    short: '75 Medium',
    tagline: 'the balanced middle path',
    days: 75,
    intensity: 'medium',
    joined: 4118,
    waterGoalMl: 3000,
    tones: MOOD.medium,
    tasks: [
      { id: 'diet', text: 'Follow a diet, one cheat meal per week', kind: 'check' },
      { id: 'workout', text: 'One 45-minute workout a day', kind: 'check' },
      { id: 'water', text: 'Drink 3 L of water', kind: 'water' },
      { id: 'steps', text: 'Walk 10,000 steps a day', kind: 'steps', steps: 10000 },
      { id: 'read', text: 'Read 10 pages a day', kind: 'check' },
      { id: 'photo', text: 'Take a progress picture every day', kind: 'photo' },
    ],
  },
  {
    id: 'soft',
    name: '75 Soft',
    short: '75 Soft',
    tagline: 'gentle, sustainable, kind to your body',
    days: 75,
    intensity: 'soft',
    joined: 9042,
    waterGoalMl: 3000,
    tones: MOOD.soft,
    tasks: [
      { id: 'diet', text: 'Eat well — alcohol only on social occasions', kind: 'check' },
      { id: 'workout', text: 'Train 45 minutes a day, one active recovery day a week', kind: 'check' },
      { id: 'water', text: 'Drink 3 L of water', kind: 'water' },
      { id: 'read', text: 'Read 10 pages of any book', kind: 'check' },
    ],
  },
  {
    id: 'glow',
    name: 'Glow Within',
    short: 'Glow Within',
    tagline: 'radiance from the inside out',
    days: 75,
    intensity: 'soft',
    joined: 2874,
    waterGoalMl: 2500,
    tones: MOOD.glow,
    tasks: [
      { id: 'skin', text: 'AM + PM skincare ritual', kind: 'check' },
      { id: 'water', text: 'Drink 2.5 L of water', kind: 'water' },
      { id: 'steps', text: 'Walk 10,000 steps', kind: 'steps', steps: 10000 },
      { id: 'sleep', text: 'Sleep 8 hours — screens off by 10pm', kind: 'check' },
      { id: 'grat', text: 'Write down 3 things you are grateful for', kind: 'check' },
    ],
  },
  {
    id: 'better',
    name: 'Better Me',
    short: 'Better Me',
    tagline: 'small promises, big transformation',
    days: 75,
    intensity: 'medium',
    joined: 3560,
    waterGoalMl: 2500,
    tones: MOOD.better,
    tasks: [
      { id: 'move', text: 'Move your body for 30 minutes', kind: 'check' },
      { id: 'water', text: 'Drink 2.5 L of water', kind: 'water' },
      { id: 'learn', text: 'Learn something new for 15 minutes', kind: 'check' },
      { id: 'eat', text: 'No eating after 8pm', kind: 'check' },
      { id: 'journal', text: 'Journal before bed', kind: 'check' },
    ],
  },
  {
    id: 'sugarfree',
    name: 'Sugar Free',
    short: 'Sugar Free',
    tagline: 'break up with refined sugar',
    days: 75,
    intensity: 'medium',
    joined: 1988,
    waterGoalMl: 2500,
    tones: MOOD.sugar,
    tasks: [
      { id: 'nosugar', text: 'No refined sugar — read every label', kind: 'check' },
      { id: 'water', text: 'Drink 2.5 L of water', kind: 'water' },
      { id: 'move', text: 'Move your body for 30 minutes', kind: 'check' },
      { id: 'whole', text: 'Eat whole foods only', kind: 'check' },
      { id: 'photo', text: 'Take a progress picture every day', kind: 'photo' },
    ],
  },
  {
    id: 'mental',
    name: 'Mental Wellness',
    short: 'Mental Wellness',
    tagline: 'a calmer, clearer, softer mind',
    days: 75,
    intensity: 'soft',
    joined: 2311,
    waterGoalMl: 2000,
    tones: MOOD.mental,
    tasks: [
      { id: 'med', text: 'Meditate for 10 minutes', kind: 'check' },
      { id: 'water', text: 'Drink 2 L of water', kind: 'water' },
      { id: 'walk', text: 'Take a phone-free walk', kind: 'check' },
      { id: 'grat', text: 'Write down 3 things you are grateful for', kind: 'check' },
      { id: 'screens', text: 'No screens one hour before bed', kind: 'check' },
    ],
  },
]

/** Sticky-note colours, cycled by task index. */
export const NOTE_COLORS = [
  'var(--note-1)',
  'var(--note-2)',
  'var(--note-3)',
  'var(--note-4)',
  'var(--note-5)',
  'var(--note-6)',
]

/* Friends were seeded fixtures — five hardcoded people whose lists never
   moved. The paywall sold "see your friends' lists in real time", which
   made them a Guideline 2.3.1 problem, not just an unfinished feature.
   Feature and fixtures both removed until there is a backend behind it. */

/* ------------------------------------------------------------------ */
/* Inspiration boards                                                  */
/* ------------------------------------------------------------------ */

export type InspoBoard = { id: string; title: string; tones: string[] }

export const BOARDS: InspoBoard[] = [
  { id: 'meals', title: 'meals', tones: ['#e4e4e4', '#cfcfcf', '#dadada', '#ebebeb', '#c6c6c6', '#dfdfdf'] },
  { id: 'workouts', title: 'workouts', tones: ['#bfbfbf', '#d6d6d6', '#a9a9a9', '#e0e0e0', '#cbcbcb', '#b4b4b4'] },
  { id: 'reads', title: 'reads', tones: ['#dcdcdc', '#eeeeee', '#c9c9c9', '#e6e6e6', '#d2d2d2', '#f2f2f2'] },
]

export const BOOKS: { title: string; author: string }[] = [
  { title: 'Atomic Habits', author: 'James Clear' },
  { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk' },
  { title: 'Big Magic', author: 'Elizabeth Gilbert' },
  { title: 'Untamed', author: 'Glennon Doyle' },
]

/* Community chat groups were removed before launch. Open group chat is
   user-generated content, which pulls in Guideline 1.2 — pre-publication
   filtering, in-app reporting, user blocking, published contact details
   and a duty to act on reports. That is a running obligation, not a
   feature, and it is not worth taking on for an empty room. Revisit once
   there are real users asking for it. */
