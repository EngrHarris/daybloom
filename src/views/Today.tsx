import type { AppState } from '../store'
import type { Update } from '../App'
import DayEditor from '../DayEditor'
import { streak, todayKey } from '../insights'

export default function Today({ state, update }: { state: AppState; update: Update }) {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const run = streak((key) => !!state.entries[key]?.mood)
  const checkedIn = !!state.entries[todayKey()]?.mood

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1>{greeting}</h1>
        <p className="muted">
          {checkedIn
            ? run > 1
              ? `Checked in. That's ${run} days in a row.`
              : 'Checked in for today. Changes save as you go.'
            : run > 0
              ? `${run}-day streak so far. Twenty seconds keeps it going.`
              : 'Twenty seconds now, clearer patterns later.'}
        </p>
      </header>
      <DayEditor state={state} update={update} date={todayKey()} />
    </>
  )
}
