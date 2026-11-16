import { useCallback, useEffect, useState } from 'react'
import { type AppState, loadState, saveState } from './store'
import Today from './views/Today'
import History from './views/History'
import Insights from './views/Insights'
import Settings from './views/Settings'

export type Update = (fn: (state: AppState) => AppState) => void

const TABS = [
  { id: 'today', label: 'Today', icon: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.4-6.4L17 7M7 17l-1.4 1.4m12.8 0L17 17M7 7 5.6 5.6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
  { id: 'history', label: 'History', icon: 'M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z' },
  { id: 'insights', label: 'Insights', icon: 'M4 20V10m6 10V4m6 16v-7m4 7H2' },
  { id: 'settings', label: 'Settings', icon: 'M4 7h10m4 0h2M4 17h2m4 0h10M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState<TabId>('today')

  useEffect(() => saveState(state), [state])

  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', state.theme)
  }, [state.theme])

  const update: Update = useCallback((fn) => setState(fn), [])

  return (
    <div className="shell">
      <nav className="tabs" aria-label="Sections">
        <div className="brand">
          <img src="./icon.svg" alt="" width="28" height="28" />
          Daybloom
        </div>
        {TABS.map((t) => (
          <button key={t.id} className="tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="page">
        {tab === 'today' && <Today state={state} update={update} />}
        {tab === 'history' && <History state={state} update={update} />}
        {tab === 'insights' && <Insights state={state} update={update} />}
        {tab === 'settings' && <Settings state={state} update={update} />}
      </main>
    </div>
  )
}
