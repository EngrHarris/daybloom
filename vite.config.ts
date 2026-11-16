import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the same build works on GitHub Pages (sub-path) and inside the Android app.
export default defineConfig({
  base: './',
  plugins: [react()],
})
