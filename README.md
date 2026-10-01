# 🌊 DayFlow — PALMI-D3V

**Plan → Do → Track → Remember**

DayFlow is the daily-orchestration layer of the PALMI-D3V productivity ecosystem.

> What was planned, what actually happened, and what should be remembered?

## Architecture

To-Do owns task creation, state, completion, lifecycle, and persistence. DayFlow owns calendar blocks, reminders, daily planning, planned-vs-actual tracking, review, and written memory. DayFlow must not create a second task database.

DayFlow now exposes a read-only To-Do provider contract so the applications can connect without transferring task ownership.

## Foundation

The application lives under `app/` and uses React 19, Vite 7, Tailwind CSS 4, vite-plugin-pwa, Lucide React, ESLint, and local-first persistence.

Implemented:
- Today dashboard with durable daily plan state
- Calendar blocks with planned/completed/skipped/changed states
- Reminder creation and completion
- Daily result persistence
- Daily review and generated memory
- Historical memory browser
- To-Do read-only provider bridge
- Production cross-origin To-Do connection via `postMessage`
- Dark / light / system theme preference
- Responsive mobile-first UI and accessibility basics
- PWA manifest and service worker foundation
- DayFlow local storage model

## Development

```bash
cd app
npm install
npm run dev
npm run lint
npm run build
```

## Roadmap

### Phase 0 — Foundation
- [x] Product definition
- [x] Visual prototype
- [x] Move application into `app/`
- [x] Establish React/Vite/Tailwind/PWA architecture
- [x] Define DayFlow domain boundaries
- [x] Theme system

### Phase 1 — To-Do Integration
- [x] Preserve To-Do ownership
- [x] Define integration contract
- [x] Add read adapter
- [x] Establish provider/bridge contract
- [x] Connect the production To-Do provider

### Phase 2 — Planning
- [x] Calendar-block model
- [x] Calendar persistence
- [x] Reminder model and persistence
- [x] Daily plan persistence
- [x] Planned vs actual snapshots

### Phase 3 — Tracking
- [x] Execution states
- [x] Daily progress
- [x] Durable daily results
- [x] Daily review workflow
- [x] Metrics/history foundation

### Phase 4 — Memory
- [x] Manual daily notes
- [x] Memory model
- [x] Generated daily summary
- [x] Historical memory browser

### Phase 5 — PWA
- [x] Manifest
- [x] Service worker foundation
- [ ] Offline validation
- [ ] Installability validation
- [ ] Sync strategy if required

## Product principle

**What is happening today → what needs attention → what has happened → what the day became.**

**PALMI-D3V · DayFlow** — *Plan your day. Live it. Remember it.* 🌊📝

## To-Do connection

For local development, copy `app/.env.example` to `app/.env.local` and point `VITE_TODO_URL` / `VITE_TODO_ORIGIN` at the running To-Do app. DayFlow opens To-Do from the Tasks view and requests read-only task snapshots.

## 🔐 Production identity and persistence

DayFlow is being prepared for a shared PALMI-D3V account model before public deployment.

- Firebase Authentication will provide the signed-in user identity.
- Firestore will provide user-scoped persistence.
- DayFlow-owned data will remain separate from To-Do-owned tasks.
- The current browser bridge is a temporary transition mechanism while Firebase is configured.
- Firebase Admin credentials must never be placed in the Vite client or Vercel environment.

See [docs/FIREBASE_ARCHITECTURE.md](docs/FIREBASE_ARCHITECTURE.md) for the planned architecture and migration order.
