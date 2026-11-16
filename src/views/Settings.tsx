import { type FormEvent, useRef, useState } from 'react'
import { type AppState, type Theme, defaultState, isNativeApp, parseState, uid } from '../store'
import type { Update } from '../App'
import Icon from '../Icon'
import { sampleState, todayKey } from '../insights'

export default function Settings({ state, update }: { state: AppState; update: Update }) {
  const [habit, setHabit] = useState('')
  const [emoji, setEmoji] = useState('')
  const [tag, setTag] = useState('')
  const [message, setMessage] = useState('')
  const [confirmErase, setConfirmErase] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const hasData = Object.keys(state.entries).length > 0

  const addHabit = (e: FormEvent) => {
    e.preventDefault()
    const name = habit.trim()
    if (!name) return
    update((s) => ({ ...s, habits: [...s.habits, { id: uid(), name, emoji: emoji.trim() || '✅' }] }))
    setHabit('')
    setEmoji('')
  }

  const addTag = (e: FormEvent) => {
    e.preventDefault()
    const name = tag.trim()
    if (!name || state.tags.some((t) => t.toLowerCase() === name.toLowerCase())) return
    update((s) => ({ ...s, tags: [...s.tags, name] }))
    setTag('')
  }

  const backup = () => JSON.stringify(state, null, 2)

  const download = () => {
    const url = URL.createObjectURL(new Blob([backup()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `daybloom-backup-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(backup())
      setMessage('Backup copied. Paste it somewhere safe.')
    } catch {
      setMessage('Could not copy the backup on this device.')
    }
  }

  const restore = async (file: File | undefined) => {
    if (!file) return
    try {
      const next = parseState(JSON.parse(await file.text()))
      if (!next) throw new Error('not a backup')
      update(() => next)
      setMessage(`Restored ${Object.keys(next.entries).length} days from the backup.`)
    } catch {
      setMessage('That file is not a Daybloom backup, so nothing was changed. Choose a file saved with the backup button.')
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <>
      <header className="page-head">
        <h1>Settings</h1>
      </header>

      <section className="card">
        <h2>Habits</h2>
        <ul className="edit-list">
          {state.habits.map((h) => (
            <li key={h.id}>
              <span>
                {h.emoji} {h.name}
              </span>
              <button className="icon-btn" aria-label={`Remove ${h.name}`} onClick={() => update((s) => ({ ...s, habits: s.habits.filter((x) => x.id !== h.id) }))}>
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
        <form className="add-row" onSubmit={addHabit}>
          <input className="emoji-input" aria-label="Emoji" placeholder="✅" maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          <input aria-label="New habit" placeholder="New habit, e.g. Stretch" maxLength={40} value={habit} onChange={(e) => setHabit(e.target.value)} />
          <button className="btn" disabled={!habit.trim()}>
            Add
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Activities</h2>
        <p className="muted small">The tags you pick each day. Insights compares your mood with and without each one.</p>
        <div className="chips">
          {state.tags.map((t) => (
            <span key={t} className="chip static">
              {t}
              <button aria-label={`Remove ${t}`} onClick={() => update((s) => ({ ...s, tags: s.tags.filter((x) => x !== t) }))}>
                <Icon name="close" size={14} />
              </button>
            </span>
          ))}
        </div>
        <form className="add-row" onSubmit={addTag}>
          <input aria-label="New activity" placeholder="New activity, e.g. Meditation" maxLength={24} value={tag} onChange={(e) => setTag(e.target.value)} />
          <button className="btn" disabled={!tag.trim()}>
            Add
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Appearance</h2>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {(['auto', 'light', 'dark'] as Theme[]).map((t) => (
            <button key={t} role="radio" aria-checked={state.theme === t} onClick={() => update((s) => ({ ...s, theme: t }))}>
              {t === 'auto' ? 'Match device' : t === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Your data</h2>
        <p className="muted small">Everything is stored only on this device. There is no account and no server, so keep a backup if it matters to you.</p>
        <div className="btn-row">
          {isNativeApp() ? (
            <button className="btn secondary" onClick={copy}>
              Copy backup
            </button>
          ) : (
            <button className="btn secondary" onClick={download}>
              Download backup
            </button>
          )}
          <button className="btn secondary" onClick={() => fileInput.current?.click()}>
            Restore from file
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
          {!hasData && (
            <button className="btn secondary" onClick={() => update(() => ({ ...sampleState(), theme: state.theme }))}>
              Load sample data
            </button>
          )}
        </div>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        {confirmErase ? (
          <div className="confirm">
            <p>Erase every check-in, habit and activity on this device? This cannot be undone.</p>
            <div className="btn-row">
              <button
                className="btn danger"
                onClick={() => {
                  update(() => ({ ...defaultState(), theme: state.theme }))
                  setConfirmErase(false)
                  setMessage('All data erased.')
                }}
              >
                Erase everything
              </button>
              <button className="btn secondary" onClick={() => setConfirmErase(false)}>
                Keep my data
              </button>
            </div>
          </div>
        ) : (
          <button className="link-danger" onClick={() => setConfirmErase(true)}>
            Erase all data…
          </button>
        )}
      </section>

      <p className="footer muted small">Daybloom 1.0 · private by design</p>
    </>
  )
}
