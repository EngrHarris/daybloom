import { type AppState, type Entry, type Level, MOODS, emptyEntry } from './store'
import { streak } from './insights'
import type { Update } from './App'

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

export default function DayEditor({ state, update, date }: { state: AppState; update: Update; date: string }) {
  const entry = state.entries[date] ?? emptyEntry()
  const patch = (change: Partial<Entry>) =>
    update((s) => ({ ...s, entries: { ...s.entries, [date]: { ...(s.entries[date] ?? emptyEntry()), ...change } } }))

  const sleep = entry.sleep
  const stepSleep = (by: number) => patch({ sleep: Math.min(14, Math.max(0, (sleep ?? 7.5 - by) + by)) })

  return (
    <>
      <section className="card">
        <h2>How was your day?</h2>
        <div className="moods" role="radiogroup" aria-label="Mood">
          {MOODS.map((m) => (
            <button
              key={m.level}
              role="radio"
              aria-checked={entry.mood === m.level}
              className={`mood m${m.level}`}
              onClick={() => patch({ mood: entry.mood === m.level ? undefined : m.level })}
            >
              <span className="mood-face">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card row-card">
        <div>
          <h2>Energy</h2>
          <div className="dots" role="radiogroup" aria-label="Energy">
            {([1, 2, 3, 4, 5] as Level[]).map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={entry.energy === n}
                aria-label={`Energy ${n} of 5`}
                className={`dot ${entry.energy && n <= entry.energy ? 'on' : ''}`}
                onClick={() => patch({ energy: entry.energy === n ? undefined : n })}
              />
            ))}
          </div>
        </div>
        <div>
          <h2>Sleep</h2>
          <div className="stepper">
            <button aria-label="Less sleep" onClick={() => stepSleep(-0.5)}>
              −
            </button>
            <output>{sleep === undefined ? '–' : `${sleep} h`}</output>
            <button aria-label="More sleep" onClick={() => stepSleep(0.5)}>
              +
            </button>
          </div>
        </div>
      </section>

      {state.tags.length > 0 && (
        <section className="card">
          <h2>What was in it?</h2>
          <div className="chips">
            {state.tags.map((tag) => (
              <button key={tag} className="chip" aria-pressed={entry.tags.includes(tag)} onClick={() => patch({ tags: toggle(entry.tags, tag) })}>
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {state.habits.length > 0 && (
        <section className="card">
          <h2>Habits</h2>
          <ul className="habits">
            {state.habits.map((h) => {
              const run = streak((key) => !!state.entries[key]?.habits.includes(h.id))
              return (
                <li key={h.id}>
                  <label>
                    <input type="checkbox" checked={entry.habits.includes(h.id)} onChange={() => patch({ habits: toggle(entry.habits, h.id) })} />
                    <span className="habit-emoji">{h.emoji}</span>
                    <span className="habit-name">{h.name}</span>
                    {run > 1 && <span className="streak">🔥 {run}</span>}
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>
          <label htmlFor={`note-${date}`}>One line about today</label>
        </h2>
        <textarea id={`note-${date}`} rows={3} placeholder="Anything worth remembering…" value={entry.note} onChange={(e) => patch({ note: e.target.value })} />
      </section>
    </>
  )
}
