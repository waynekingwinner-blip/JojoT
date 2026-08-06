/* ============================================================
   data.ts — challenge presets, seed friends, inspiration.

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
      { id: 'become', text: 'Become that girl', kind: 'check' },
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

/* ------------------------------------------------------------------ */
/* Friends                                                             */
/* ------------------------------------------------------------------ */

export type FriendTask = { text: string; done: boolean; at?: string }

export type Friend = {
  id: string
  name: string
  initial: string
  tone: string
  day: number
  challenge: string
  tasks: FriendTask[]
}

export const FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Maddy',
    initial: 'M',
    tone: 'linear-gradient(135deg,#8e8e8e,#3f3f3f)',
    day: 75,
    challenge: '75 Hard',
    tasks: [
      { text: 'Walk 10,000 steps', done: false },
      { text: 'Read 10 pages', done: false },
      { text: 'Workout', done: false },
      { text: 'Follow a strict diet', done: true, at: '11:45am' },
    ],
  },
  {
    id: 'f2',
    name: 'Anna',
    initial: 'A',
    tone: 'linear-gradient(135deg,#a8a8a8,#585858)',
    day: 75,
    challenge: '75 Hard',
    tasks: [
      { text: 'Walk 10,000 steps', done: false },
      { text: 'Read 10 pages', done: false },
      { text: 'Workout', done: true, at: '10:45am' },
      { text: 'Follow a strict diet', done: true, at: '11:45am' },
    ],
  },
  {
    id: 'f3',
    name: 'Blake',
    initial: 'B',
    tone: 'linear-gradient(135deg,#c2c2c2,#767676)',
    day: 75,
    challenge: '75 Medium',
    tasks: [
      { text: 'Walk 10,000 steps', done: false },
      { text: 'Read 10 pages', done: false },
      { text: 'Workout', done: false },
      { text: 'Follow a strict diet', done: false },
    ],
  },
  {
    id: 'f4',
    name: 'Sofia',
    initial: 'S',
    tone: 'linear-gradient(135deg,#9a9a9a,#4c4c4c)',
    day: 42,
    challenge: '75 Soft',
    tasks: [
      { text: 'Drink 3 L of water', done: true, at: '9:10am' },
      { text: 'Train 45 minutes', done: true, at: '7:30am' },
      { text: 'Read 10 pages', done: false },
      { text: 'Eat well', done: true, at: '1:20pm' },
    ],
  },
  {
    id: 'f5',
    name: 'Priya',
    initial: 'P',
    tone: 'linear-gradient(135deg,#b4b4b4,#666666)',
    day: 22,
    challenge: 'Glow Within',
    tasks: [
      { text: 'AM + PM skincare', done: true, at: '8:05am' },
      { text: 'Walk 10,000 steps', done: false },
      { text: 'Sleep 8 hours', done: true, at: '6:50am' },
      { text: 'Gratitude', done: false },
    ],
  },
]

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

/* ------------------------------------------------------------------ */
/* Community chat                                                      */
/* ------------------------------------------------------------------ */

export type ChatGroup = { id: string; name: string; members: number; last: string; when: string }

export const CHAT_GROUPS: ChatGroup[] = [
  { id: 'g1', name: '75 Hard — June intake', members: 1284, last: 'Anna: day 61 and my skin has never…', when: '2m' },
  { id: 'g2', name: 'Morning workout club', members: 642, last: 'Maddy: 5am crew, who’s up', when: '18m' },
  { id: 'g3', name: 'Sugar free support', members: 389, last: 'Blake: the label reading is unreal', when: '1h' },
  { id: 'g4', name: 'Book of the month', members: 917, last: 'Sofia: finished chapter 4, obsessed', when: '3h' },
]

export type ChatMessage = { id: string; who: string; text: string; when: string; me?: boolean }

export const CHAT_THREAD: ChatMessage[] = [
  { id: 'm1', who: 'Anna', text: 'day 61 and my skin has never looked like this', when: '11:02' },
  { id: 'm2', who: 'Maddy', text: 'ok but the outdoor workout in the rain today, brutal', when: '11:04' },
  { id: 'm3', who: 'Blake', text: 'genuinely the water is the hardest part', when: '11:09' },
  { id: 'm4', who: 'you', text: 'gallon by 3pm or it never happens', when: '11:11', me: true },
  { id: 'm5', who: 'Anna', text: 'writing that down', when: '11:12' },
]
