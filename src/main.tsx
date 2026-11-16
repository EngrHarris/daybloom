import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { isNativeApp } from './store'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline support for the web app; the Android app already ships its files.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !isNativeApp()) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
