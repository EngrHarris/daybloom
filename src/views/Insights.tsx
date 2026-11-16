import type { AppState } from '../store'
import type { Update } from '../App'
import { type Impact, averageMood, lastDays, parseKey, sampleState, sleepImpact, streak, tagImpacts } from '../insights'

function MoodChart({ state, keys }: { state: AppState; keys: string[] }) {
  const W = 300
  const H = 110
  const x = (i: number) => 8 + (i / (keys.length - 1)) * (W - 16)
  const y = (mood: number) => H - 10 - ((mood - 1) / 4) * (H - 20)
  const points = keys.flatMap((key, i) => {
    const mood = state.entries[key]?.mood
    return mood ? [{ x: x(i), y: y(mood), mood }] : []
  })
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mood over the last 30 days">
      {[1, 3, 5].map((m) => (
        <line key={m} x1="0" x2={W} y1={y(m)} y2={y(m)} className="grid" />
      ))}
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} className="line" />
      {points.map((p) => (
        <circle key={p.x} cx={p.x} cy={p.y} r="3.2" className={`pt m${p.mood}`} />
      ))}
    </svg>
  )
}

function ImpactRow({ impact, max }: { impact: Impact; max: number }) {
  const up = impact.diff >= 0
  return (
    <li className="impact">
      <span className="impact-label">
        {impact.label}
        <small>{impact.days} days</small>
      </span>
      <span className="impact-bar">
        <i className={up ? 'up' : 'down'} style={{ width: `${Math.max(4, (Math.abs(impact.diff) / max) * 100)}%` }} />
      </span>
      <span className={`impact-num ${up ? 'up' : 'down'}`}>
        {up ? '+' : '−'}
        {Math.abs(impact.diff).toFixed(1)}
      </span>
    </li>
  )
}

export default function Insights({ state, update }: { state: AppState; update: Update }) {
  const days30 = lastDays(30)
  const rated = Object.values(state.entries).filter((e) => e.mood).length
  const avg = averageMood(state, days30)
  const run = streak((key) => !!state.entries[key]?.mood)
  const impacts = tagImpacts(state)
  const sleep = sleepImpact(state)
  const all = sleep ? [...impacts, sleep] : impacts
  const max = Math.max(0.5, ...all.map((i) => Math.abs(i.diff)))

  if (rated === 0) {
    return (
      <>
        <header className="page-head">
          <h1>Insights</h1>
        </header>
        <section className="card empty">
          <img className="empty-art" src="./icon.svg" alt="" width="56" height="56" />
          <h2>Nothing to show yet</h2>
          <p className="muted">Check in for a few days and Daybloom will show which activities go with your better days.</p>
          <button className="btn" onClick={() => update(() => ({ ...sampleState(), theme: state.theme }))}>
            Explore with sample data
          </button>
        </section>
      </>
    )
  }

  return (
    <>
      <header className="page-head">
        <h1>Insights</h1>
        <p className="muted">
          {rated} {rated === 1 ? 'check-in' : 'check-ins'} so far{run > 1 ? `, ${run} days in a row` : ''}.
          {avg ? ` Your mood has averaged ${avg.toFixed(1)} out of 5 over the last 30 days.` : ''}
        </p>
      </header>

      <section className="card">
        <h2>Mood, last 30 days</h2>
        <MoodChart state={state} keys={days30} />
        <div className="chart-axis">
          <span>{parseKey(days30[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span>Today</span>
        </div>
      </section>

      <section className="card">
        <h2>What goes with better days</h2>
        {all.length === 0 ? (
          <p className="muted">Keep tagging your days. Each activity needs at least 3 days with it and 3 without before it shows up here.</p>
        ) : (
          <>
            <p className="muted small">Mood on days with each activity, compared with days without it (scale of 1 to 5).</p>
            <ul className="impacts">
              {impacts.map((i) => (
                <ImpactRow key={i.label} impact={i} max={max} />
              ))}
              {sleep && <ImpactRow impact={sleep} max={max} />}
            </ul>
            <p className="muted small">These are patterns, not proof of cause. Use them as hints for what to try more of.</p>
          </>
        )}
      </section>

      {state.habits.length > 0 && (
        <section className="card">
          <h2>Habits, last 30 days</h2>
          <ul className="habit-stats">
            {state.habits.map((h) => {
              const done = days30.filter((k) => state.entries[k]?.habits.includes(h.id)).length
              return (
                <li key={h.id}>
                  <span>
                    {h.emoji} {h.name}
                  </span>
                  <span className="meter" role="img" aria-label={`${done} of 30 days`}>
                    <i style={{ width: `${(done / 30) * 100}%` }} />
                  </span>
                  <span className="habit-count">{done}/30</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
