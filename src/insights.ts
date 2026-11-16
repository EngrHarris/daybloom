import { type AppState, type Entry, type Level, defaultState } from './store'

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export const todayKey = () => dateKey(new Date())

/** Keys for the last n days, oldest first, ending today. */
export const lastDays = (n: number) => {
  const today = new Date()
  return Array.from({ length: n }, (_, i) => dateKey(addDays(today, i - n + 1)))
}

/** Consecutive days ending today (or yesterday, so an unfinished today doesn't break a streak). */
export function streak(isDone: (key: string) => boolean) {
  let day = new Date()
  if (!isDone(dateKey(day))) day = addDays(day, -1)
  let count = 0
  while (isDone(dateKey(day))) {
    count++
    day = addDays(day, -1)
  }
  return count
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

export interface Impact {
  label: string
  diff: number
  days: number
}

const MIN_DAYS = 3

function compare(rated: Entry[], label: string, has: (e: Entry) => boolean): Impact | null {
  const yes = rated.filter(has)
  const no = rated.filter((e) => !has(e))
  if (yes.length < MIN_DAYS || no.length < MIN_DAYS) return null
  return { label, diff: mean(yes.map((e) => e.mood!)) - mean(no.map((e) => e.mood!)), days: yes.length }
}

/** How much higher or lower mood is on days with each activity, versus days without it. */
export function tagImpacts(state: AppState): Impact[] {
  const rated = Object.values(state.entries).filter((e) => e.mood)
  const tags = new Set(rated.flatMap((e) => e.tags))
  return [...tags]
    .map((tag) => compare(rated, tag, (e) => e.tags.includes(tag)))
    .filter((x): x is Impact => x !== null)
    .sort((a, b) => b.diff - a.diff)
}

export function sleepImpact(state: AppState): Impact | null {
  const rated = Object.values(state.entries).filter((e) => e.mood && e.sleep !== undefined)
  return compare(rated, '7+ hours of sleep', (e) => e.sleep! >= 7)
}

export function averageMood(state: AppState, keys: string[]) {
  const moods = keys.map((k) => state.entries[k]?.mood).filter((m): m is Level => !!m)
  return moods.length ? mean(moods) : null
}

/** Two months of believable data so Insights has something to show on first look. */
export function sampleState(): AppState {
  const state = defaultState()
  const chance = (p: number) => Math.random() < p
  for (const key of lastDays(60)) {
    if (chance(0.1)) continue
    const sleep = 5.5 + Math.round(Math.random() * 6) / 2
    const picks: Record<string, boolean> = {
      Exercise: chance(0.4),
      Outdoors: chance(0.45),
      Friends: chance(0.3),
      Family: chance(0.35),
      Reading: chance(0.35),
      'Good food': chance(0.4),
      'Deep work': chance(0.35),
      'Late screens': chance(0.35),
      Stress: chance(0.25),
    }
    const score =
      2.9 +
      (picks.Exercise ? 0.7 : 0) +
      (picks.Outdoors ? 0.5 : 0) +
      (picks.Friends ? 0.5 : 0) +
      (picks['Late screens'] ? -0.6 : 0) +
      (picks.Stress ? -0.8 : 0) +
      (sleep - 7) * 0.35 +
      (Math.random() - 0.5) * 1.2
    const clamp = (n: number) => Math.min(5, Math.max(1, Math.round(n))) as Level
    state.entries[key] = {
      mood: clamp(score),
      energy: clamp(score + (sleep - 7) * 0.3 + (Math.random() - 0.5)),
      sleep,
      tags: Object.keys(picks).filter((t) => picks[t]),
      habits: state.habits.filter(() => chance(0.7)).map((h) => h.id),
      note: '',
    }
  }
  return state
}
