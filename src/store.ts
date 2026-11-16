export type Level = 1 | 2 | 3 | 4 | 5

export interface Entry {
  mood?: Level
  energy?: Level
  sleep?: number
  tags: string[]
  habits: string[]
  note: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
}

export type Theme = 'auto' | 'light' | 'dark'

export interface AppState {
  entries: Record<string, Entry>
  habits: Habit[]
  tags: string[]
  theme: Theme
}

export const MOODS: { level: Level; emoji: string; label: string }[] = [
  { level: 1, emoji: '😞', label: 'Rough' },
  { level: 2, emoji: '😕', label: 'Low' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
]

const KEY = 'daybloom.v1'

export const uid = () => Math.random().toString(36).slice(2, 10)

export const emptyEntry = (): Entry => ({ tags: [], habits: [], note: '' })

export const defaultState = (): AppState => ({
  entries: {},
  habits: [
    { id: 'water', name: 'Drink enough water', emoji: '💧' },
    { id: 'move', name: 'Move for 20 minutes', emoji: '🚶' },
    { id: 'read', name: 'Read 10 pages', emoji: '📖' },
  ],
  tags: ['Exercise', 'Outdoors', 'Friends', 'Family', 'Reading', 'Good food', 'Deep work', 'Rest', 'Late screens', 'Stress'],
  theme: 'auto',
})

/** Accepts anything (storage, imported file) and returns a valid state or null. */
export function parseState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<AppState>
  if (!r.entries || typeof r.entries !== 'object' || !Array.isArray(r.habits) || !Array.isArray(r.tags)) return null
  const entries: Record<string, Entry> = {}
  for (const [date, value] of Object.entries(r.entries)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== 'object') continue
    const e = value as Partial<Entry>
    const level = (n: unknown) => (typeof n === 'number' && n >= 1 && n <= 5 ? (Math.round(n) as Level) : undefined)
    entries[date] = {
      mood: level(e.mood),
      energy: level(e.energy),
      sleep: typeof e.sleep === 'number' && e.sleep >= 0 && e.sleep <= 24 ? e.sleep : undefined,
      tags: Array.isArray(e.tags) ? e.tags.filter((t) => typeof t === 'string') : [],
      habits: Array.isArray(e.habits) ? e.habits.filter((t) => typeof t === 'string') : [],
      note: typeof e.note === 'string' ? e.note : '',
    }
  }
  return {
    entries,
    habits: r.habits
      .filter((h) => h && typeof h.id === 'string' && typeof h.name === 'string')
      .map((h) => ({ id: h.id, name: h.name, emoji: typeof h.emoji === 'string' ? h.emoji : '✅' })),
    tags: r.tags.filter((t) => typeof t === 'string'),
    theme: r.theme === 'light' || r.theme === 'dark' ? r.theme : 'auto',
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return parseState(JSON.parse(raw)) ?? defaultState()
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return defaultState()
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked */
  }
}

/** True inside the Android app (Capacitor), false in a browser. */
export const isNativeApp = () =>
  !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
