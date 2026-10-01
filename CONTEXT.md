# 🧠 DayFlow — PALMI-D3V Chat Context

> Current project context. Treat GitHub `main` as the source of truth before making implementation changes.

## Context Date

**2026-10-01**

## Identity

- Repository: **palmid3v/dayflow-palmid3v**
- Product: **DayFlow**
- Role: daily orchestration, tracking, and written-memory layer
- Default branch: `main`
- Current main commit: `f69b7b84d4c1417e3ceebd40e8e230f628c89035`
- Latest merged change: **PR #8 — fix: remove cross-origin popup event listener**
- Application directory: **`app/`**
- Production URL: **https://dayflow-palmid3v.vercel.app**

## Product Definition

```text
PLAN → DO → TRACK → REMEMBER
```

DayFlow combines:

- 📅 Calendar
- 🔔 Reminders
- ✅ To-Do tasks
- 🌅 Daily planning
- 📊 Execution tracking
- 📝 Written daily memory

Key question:

> **What was planned, what actually happened, and what should be remembered?**

## Ownership Boundary

### To-Do owns

- Task creation
- Task editing
- Task state
- Completion
- Task lifecycle
- Task persistence

### DayFlow owns

- Calendar blocks
- Reminders
- Daily planning
- Daily orchestration
- Planned vs. actual tracking
- Daily review
- Written memory

**Never create a second persistent task database inside DayFlow.**

## Current Stack

```text
React 19
Vite 7
Tailwind CSS 4
vite-plugin-pwa
Lucide React
ESLint
Firebase Authentication
Firestore readiness
Local-first DayFlow persistence
```

## Current Architecture

```text
dayflow-palmid3v/
├── app/
│   ├── src/
│   │   ├── domain/
│   │   └── lib/
│   │       ├── backendConfig.js
│   │       ├── dayflowStore.js
│   │       └── todoAdapter.js
│   ├── public/
│   ├── package.json
│   └── vite.config.*
├── archive/
├── CONTEXT.md
└── README.md
```

### Important files

- `src/App.jsx` — primary application shell and workflows
- `src/domain/models.js` — DayFlow domain model helpers
- `src/lib/dayflowStore.js` — local DayFlow persistence
- `src/lib/todoAdapter.js` — read-only To-Do integration
- `src/lib/backendConfig.js` — static Vite Firebase configuration
- `src/lib/firebase.js` — Firebase application/auth boundary

## To-Do Integration

Repository: **palmid3v/to-do**

Production:

```text
DayFlow: https://dayflow-palmid3v.vercel.app
To-Do:   https://to-do-palmid3v.vercel.app
```

DayFlow uses:

```text
VITE_TODO_URL
VITE_TODO_ORIGIN
```

Production values:

```text
VITE_TODO_URL=https://to-do-palmid3v.vercel.app
VITE_TODO_ORIGIN=https://to-do-palmid3v.vercel.app
```

Protocol:

```text
Channel:  PALMI_D3V_TODO
Version:  1.0.0
Request:  GET_TASKS
Response: TASKS
Update:   TASKS_UPDATED
```

The bridge is read-only from DayFlow's perspective.

### Cross-origin constraint

Do not access properties or event APIs on the cross-origin popup WindowProxy.

The previous implementation attempted:

```js
popup.addEventListener?.("load", requestTasks);
```

This caused the browser error:

```text
Blocked a frame with origin ... from accessing a cross-origin frame.
```

PR #8 removed that access. The bridge now relies on the timed `postMessage` request, which is the correct cross-origin mechanism.

## Firebase

Firebase Authentication is integrated.

- Email/Password authentication is enabled.
- Vite Firebase variables are referenced statically.
- Production values are configured in Vercel.
- DayFlow-owned persistence remains local-first for now.
- Firestore is the target for user-scoped DayFlow persistence.
- Firebase Admin credentials must never be placed in the client.

## Current Product State

Implemented:

- Today dashboard
- Daily plan persistence
- Calendar blocks
- Planned/completed/skipped/changed states
- Reminder creation/completion/deletion
- Daily results
- Daily review
- Generated daily memory
- Historical memory browser
- Theme system
- Responsive mobile-first UI
- PWA foundation
- Firebase authentication boundary
- Read-only To-Do integration
- Production Vercel environment configuration
- Cross-origin popup compatibility fix

## Roadmap

### Phase 0 — Foundation
**Status: ✅ Complete**

- [x] Repository structure
- [x] Product definition
- [x] React/Vite/Tailwind/PWA architecture
- [x] DayFlow domain boundaries
- [x] Theme system
- [x] Firebase authentication boundary

### Phase 1 — To-Do Integration
**Status: ✅ Implemented**

- [x] Preserve To-Do ownership
- [x] Define shared contract
- [x] Read adapter
- [x] Browser message bridge
- [x] Production origins
- [x] Cross-origin popup fix
- [ ] Finalize long-term shared Firestore task source

### Phase 2 — Planning
**Status: ✅ Implemented**

- [x] Calendar model
- [x] Calendar persistence
- [x] Reminder model/persistence
- [x] Daily plan
- [x] Planned vs. actual state

### Phase 3 — Tracking
**Status: ✅ Implemented**

- [x] Execution tracking
- [x] Daily progress
- [x] Daily result
- [x] Daily review
- [x] History foundation

### Phase 4 — Memory
**Status: ✅ Implemented**

- [x] Memory model
- [x] Generated summary
- [x] Manual notes
- [x] History

### Phase 5 — PWA
**Status: 🟡 Validation pending**

- [x] Manifest
- [x] Service worker foundation
- [ ] Offline validation
- [ ] Installability validation
- [ ] Sync strategy if required

### Phase 6 — Identity & Persistence
**Status: 🟡 In progress**

- [x] Firebase Authentication
- [x] Production Firebase configuration
- [ ] Firestore persistence for DayFlow-owned data
- [ ] Cross-device persistence validation
- [ ] Final sync architecture

## Working Rules

- Keep mobile-first.
- Keep UI polished but practical.
- Use emojis intentionally.
- Never duplicate To-Do ownership.
- Prefer local-first while DayFlow persistence is being migrated.
- Use Firebase Auth for identity.
- Keep Firebase Admin credentials out of client code.
- Treat Vercel env vars as build-time configuration.
- After changing Vercel env vars, redeploy Production.
- Validate lint/build after implementation changes.
- Keep documentation synchronized with actual GitHub state.
- Keep `archive/` for historical material.
- Prefer small, traceable branches/PRs for implementation changes.

## Definition of Success

DayFlow should show:

**What is happening today → what needs attention → what has happened → what the day became.**

At the end:

> **DayFlow turns the day into a memory.** 🌊📝
