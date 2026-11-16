import type { Level } from './store'

// One drawn icon family: 24px grid, 1.8 stroke, round caps. No emoji or text glyphs as icons.
const PATHS = {
  today: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.4-6.4L17 7M7 17l-1.4 1.4m12.8 0L17 17M7 7 5.6 5.6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  history: 'M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  insights: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  settings: 'M4 7h10m4 0h2M4 17h2m4 0h10M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z',
  minus: 'M6 12h12',
  plus: 'M12 6v12M6 12h12',
  close: 'm7 7 10 10M17 7 7 17',
  prev: 'm14 6-6 6 6 6',
  next: 'm10 6 6 6-6 6',
}

export type IconName = keyof typeof PATHS

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export default function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...stroke}>
      <path d={PATHS[name]} />
    </svg>
  )
}

const MOUTHS: Record<Level, string> = {
  1: 'M8.5 16.5Q12 13 15.5 16.5',
  2: 'M9 16Q12 14.5 15 16',
  3: 'M9 15.5h6',
  4: 'M9 14.5Q12 17 15 14.5',
  5: 'M8 13.5h8a4 4 0 0 1-8 0Z',
}

/** Mood face drawn in the same stroke as the rest of the icons, so it looks the same on every device. */
export function MoodFace({ level, size = 32 }: { level: Level; size?: number }) {
  return (
    <svg className="face" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...stroke}>
      <circle className="face-bg" cx="12" cy="12" r="9.5" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" />
      <path d={MOUTHS[level]} fill={level === 5 ? 'currentColor' : 'none'} />
    </svg>
  )
}
