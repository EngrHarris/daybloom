import { useState } from 'react'
import { type AppState, MOODS } from '../store'
import type { Update } from '../App'
import DayEditor from '../DayEditor'
import { dateKey, parseKey, todayKey } from '../insights'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function History({ state, update }: { state: AppState; update: Update }) {
  const today = todayKey()
  const [selected, setSelected] = useState(today)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const offset = (month.getDay() + 6) % 7 // Monday-first
  const isCurrentMonth = dateKey(month).slice(0, 7) === today.slice(0, 7)
  const shift = (by: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1))

  return (
    <>
      <header className="page-head">
        <h1>History</h1>
        <p className="muted">Tap any day to see it or fill it in.</p>
      </header>

      <section className="card">
        <div className="cal-head">
          <button className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}>
            ‹
          </button>
          <strong>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
          <button className="icon-btn" aria-label="Next month" disabled={isCurrentMonth} onClick={() => shift(1)}>
            ›
          </button>
        </div>
        <div className="cal">
          {WEEKDAYS.map((d) => (
            <span key={d} className="cal-dow">
              {d}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const key = dateKey(new Date(month.getFullYear(), month.getMonth(), i + 1))
            const mood = state.entries[key]?.mood
            return (
              <button
                key={key}
                className={`cal-day ${mood ? `m${mood}` : ''} ${key === today ? 'is-today' : ''}`}
                aria-pressed={key === selected}
                aria-label={`${parseKey(key).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}${mood ? `, ${MOODS[mood - 1].label}` : ''}`}
                disabled={key > today}
                onClick={() => setSelected(key)}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <div className="legend" aria-hidden="true">
          {MOODS.map((m) => (
            <span key={m.level}>
              <i className={`m${m.level}`} />
              {m.label}
            </span>
          ))}
        </div>
      </section>

      <h2 className="section-title">{parseKey(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
      <DayEditor state={state} update={update} date={selected} />
    </>
  )
}
