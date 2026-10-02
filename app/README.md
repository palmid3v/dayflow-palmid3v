# 🌊 DayFlow — App

Active PALMI-D3V daily-orchestration application.

## 🎨 Mini mockup

~~~text
┌──────────────────────────────────────┐
│ 🌊 Thursday · Your day, in one flow │
├──────────────────────────────────────┤
│ 72%  TODAY'S FLOW                    │
│ 08:00 🏋️ Training          ✓         │
│ 10:00 💻 Deep work         ✓         │
│ 13:00 🍽️ Lunch             →         │
│ 16:00 🚀 Project            →         │
│                                      │
│ 🔔 Reminders   📝 Memory   ✅ Tasks  │
└──────────────────────────────────────┘
~~~

## Phase status

- Product / Phase 1: ✅
- UX/UI / Phase 2: ✅
- Architecture & data / Phase 3: ✅
- Shared Firebase identity + email verification: ✅
- App-level access gate: ✅
- Shared backend/external integrations: ⏸️ next phase

See docs/PHASES_1_3.md.

## Ownership

DayFlow owns daily plans, reminders, execution tracking, daily review and memory.

To-Do owns tasks. Timetable owns recurring schedules and occurrences.

## Data model

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

References use taskId and future occurrenceId; source applications remain authoritative.

## Current modules

- src/App.jsx — daily orchestration UI
- src/lib/dayflowStore.js — local state persistence/recovery
- src/lib/dayflowCloudStore.js — Firestore persistence and synchronization
- src/lib/todoAdapter.js — read-only To-Do bridge
- src/domain/models.js — execution/result/memory models
- src/lib/firebase.js — Firebase boundary
- src/lib/access.js — shared PALMI-D3V app access
- Authentication UX includes visible Sign out in all relevant auth states

## Persistence

Authenticated DayFlow sessions restore cloud data before the main UI becomes interactive. Local `DAYFLOW` storage remains the recovery/cache layer if cloud synchronization fails.

## Weekly summary

DayFlow records are consumed by the shared weekly summary backend in the Timetable repository.

## Commands

~~~bash
npm install
npm run dev
npm run lint
npm run build
~~~
