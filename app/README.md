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
- src/lib/dayflowStore.js — local state persistence
- src/lib/todoAdapter.js — read-only To-Do bridge
- src/domain/models.js — execution/result/memory models
- src/lib/firebase.js — Firebase boundary

## Commands

~~~bash
npm install
npm run dev
npm run lint
npm run build
~~~
