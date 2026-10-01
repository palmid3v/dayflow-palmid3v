# 🌊 DayFlow — App

Active PALMI-D3V daily-orchestration application.

## 🎨 Mini mockup

~~~text
┌──────────────────────────────────────┐
│ 🌊 Thursday · Your day, in one flow │
├──────────────────────────────────────┤
│ 72%  TODAY'S FLOW                    │
│                                      │
│ 08:00 🏋️ Training          ✓         │
│ 10:00 💻 Deep work         ✓         │
│ 13:00 🍽️ Lunch             →         │
│ 16:00 🚀 Project            →         │
│                                      │
│ 🔔 Reminders   📝 Memory   ✅ Tasks  │
└──────────────────────────────────────┘
~~~

## Stack

React + Vite + Tailwind CSS + PWA + Firebase Authentication / Firestore readiness + Lucide React + ESLint.

## Product boundary

DayFlow owns:

- 📅 daily plan
- 🔔 reminders
- 📊 execution tracking
- 📝 daily review
- 🧠 written memory

To-Do owns tasks. Timetable owns recurring schedule and schedule occurrences.

## Architecture

~~~text
🔐 Firebase Auth
       │
       ▼
☁️ Firestore
 ┌─────┼──────────┐
 ▼     ▼          ▼
To-Do Timetable  DayFlow
tasks  schedule   plans/results
                  memory
~~~

DayFlow should reference source records instead of copying them into another authoritative store.

## Current integration

The existing To-Do browser bridge remains compatible with the current production setup. It is a transitional transport and can later be replaced by authenticated shared references.

## DayFlow-owned Firestore direction

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

## Commands

~~~bash
npm install
npm run dev
npm run lint
npm run build
~~~

See docs/INTEGRATION_CONTRACT.md and docs/FIREBASE_ARCHITECTURE.md.
