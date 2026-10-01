# 🌊 DayFlow — PALMI-D3V

**Plan → Do → Track → Remember**

DayFlow is the daily-orchestration layer of the PALMI-D3V productivity ecosystem.

> What was planned, what actually happened, and what should be remembered?

## Architecture

To-Do owns task creation, state, completion, lifecycle, and persistence. DayFlow owns calendar blocks, reminders, daily planning, planned-vs-actual tracking, daily review, and written memory.

**DayFlow must not create a second task database.**

DayFlow consumes To-Do through a **read-only browser `postMessage` bridge**. To-Do remains the authoritative task system.

### Domain ownership

| Domain | Owner |
|---|---|
| Task creation | To-Do |
| Task state/completion | To-Do |
| Task persistence | To-Do |
| Calendar blocks | DayFlow |
| Reminders | DayFlow |
| Daily planning | DayFlow |
| Planned vs. actual tracking | DayFlow |
| Daily review | DayFlow |
| Written memory | DayFlow |

## Current status

**Status:** 🟢 Core product foundation implemented and production integration configured.

Current implementation baseline:

- Latest implementation commit: `f69b7b84d4c1417e3ceebd40e8e230f628c89035`
- PR #6: static Vite Firebase env references — merged
- PR #7: static Vite To-Do env references — merged
- PR #8: cross-origin popup listener fix — merged

Production:

- DayFlow: `https://dayflow-palmid3v.vercel.app`
- To-Do: `https://to-do-palmid3v.vercel.app`

The production Vercel configuration requires:

```text
VITE_TODO_URL=https://to-do-palmid3v.vercel.app
VITE_TODO_ORIGIN=https://to-do-palmid3v.vercel.app
```

Firebase Authentication is also configured at the application boundary.

## Foundation

The application lives under `app/` and uses:

- React 19
- Vite 7
- Tailwind CSS 4
- vite-plugin-pwa
- Lucide React
- ESLint
- Firebase Authentication / Firestore readiness
- Local-first DayFlow persistence

Implemented:

- Today dashboard with durable daily plan state
- Calendar blocks with planned/completed/skipped/changed states
- Reminder creation and completion
- Daily result persistence
- Daily review and generated memory
- Historical memory browser
- To-Do read-only provider bridge
- Production cross-origin To-Do connection
- Cross-origin popup compatibility fix
- Dark / light / system theme preference
- Responsive mobile-first UI
- PWA manifest and service-worker foundation
- Firebase authentication boundary
- Static Vite environment configuration for production

## To-Do integration

The bridge uses:

```text
Channel:  PALMI_D3V_TODO
Version:  1.0.0

DayFlow  ── GET_TASKS ──►  To-Do
DayFlow  ◄─ TASKS ───────  To-Do
DayFlow  ◄─ TASKS_UPDATED  To-Do
```

The integration is intentionally read-only from DayFlow's perspective.

DayFlow opens the To-Do application and exchanges task snapshots through `postMessage`. It does not write to the To-Do task store.

### Local development

Copy `app/.env.example` to `app/.env.local`:

```text
VITE_TODO_URL=http://localhost:5173
VITE_TODO_ORIGIN=http://localhost:5173

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Production

Vite environment variables are build-time values. After changing Vercel environment variables, create a new Production deployment.

## Firebase

Firebase Authentication is integrated at the application boundary.

- Email/Password authentication is enabled.
- Firebase Web SDK configuration is supplied through Vite environment variables.
- DayFlow-owned data remains separate from To-Do-owned tasks.
- Firestore is the target for user-scoped DayFlow persistence.
- Firebase Admin credentials must never be placed in the Vite client or Vercel environment.

See [docs/FIREBASE_ARCHITECTURE.md](docs/FIREBASE_ARCHITECTURE.md).

## Development

```powershell
cd app
npm install
npm run dev
npm run lint
npm run build
```

## Structure

```text
dayflow-palmid3v/
├── app/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.*
│   └── ...
├── archive/
├── CONTEXT.md
└── README.md
```

## Roadmap

### Phase 0 — Foundation
- [x] Product definition
- [x] Visual prototype
- [x] Move application into `app/`
- [x] Establish React/Vite/Tailwind/PWA architecture
- [x] Define DayFlow domain boundaries
- [x] Theme system
- [x] Firebase authentication boundary

### Phase 1 — To-Do Integration
- [x] Preserve To-Do ownership
- [x] Define integration contract
- [x] Add read adapter
- [x] Establish provider/bridge contract
- [x] Configure production Vercel origins
- [x] Connect the production To-Do provider
- [x] Fix cross-origin popup access

### Phase 2 — Planning
- [x] Calendar-block model
- [x] Calendar persistence
- [x] Reminder model and persistence
- [x] Daily plan persistence
- [x] Planned vs. actual snapshots

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

### Phase 6 — Identity & Persistence
- [x] Firebase Authentication boundary
- [x] Production Firebase environment configuration
- [ ] Move DayFlow-owned persistence to user-scoped Firestore
- [ ] Validate persistence across devices/sessions
- [ ] Define final sync strategy

## Product principle

**What is happening today → what needs attention → what has happened → what the day became.**

**PALMI-D3V · DayFlow** — *Plan your day. Live it. Remember it.* 🌊📝
