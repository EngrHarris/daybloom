import { useCallback, useEffect, useState } from 'react'
import { type AppState, loadState, saveState } from './store'
import Icon from './Icon'
import Today from './views/Today'
import History from './views/History'
import Insights from './views/Insights'
import Settings from './views/Settings'

export type Update = (fn: (state: AppState) => AppState) => void

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'history', label: 'History' },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
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
            <Icon name={t.id} />
            {t.label}
          </button>
        ))}
      </nav>
      <main className="page" key={tab}>
        {tab === 'today' && <Today state={state} update={update} />}
        {tab === 'history' && <History state={state} update={update} />}
        {tab === 'insights' && <Insights state={state} update={update} />}
        {tab === 'settings' && <Settings state={state} update={update} />}
      </main>
    </div>
  )
}
