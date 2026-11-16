# Daybloom

A private, 20-second daily check-in. Log your mood, energy, sleep, what was in your day and a few habits. After a couple of weeks, Daybloom shows which activities go with your better days.

- **No account, no server.** Everything stays on your device. Back up or restore from Settings.
- **Web app** that installs to a phone home screen and works offline.
- **Android app** built from the same code.

## What's inside

| Screen | What it does |
| --- | --- |
| Today | Mood, energy, sleep, activity tags, habit checklist with streaks, a one-line note |
| History | Month calendar coloured by mood; tap any day to view or fill it in |
| Insights | 30-day mood chart, mood with vs without each activity, sleep effect, habit completion |
| Settings | Edit habits and activities, light/dark theme, backup, restore, erase |

## Run it locally

```bash
npm install
npm run dev
```

`npm run build` type-checks and writes the production site to `dist/`.

## How it ships

- `.github/workflows/deploy-web.yml` publishes the web app to GitHub Pages on every push to `main`.
- `.github/workflows/build-android.yml` wraps the same build with Capacitor, builds an APK and attaches it to the `android-latest` release.

The APK is a debug build signed with a temporary key, which is fine for installing directly on your own phone. Publishing to Google Play needs a release build signed with your own key.

## Tech

React, TypeScript, Vite, Capacitor. Data is stored in the browser's local storage.
