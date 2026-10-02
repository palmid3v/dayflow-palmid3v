# 🌊 DayFlow — Daily Orchestration

DayFlow is the daily-orchestration layer of the PALMI-D3V productivity ecosystem. It combines daily plans, execution tracking, reminders, review, and memory while referencing tasks and schedules owned by the other ecosystem applications.

> **Current status:** Phase 1 product, Phase 2 UX/UI, and Phase 3 architecture/data are complete. Shared Firebase identity, email verification, and app-level access are implemented. External integrations remain the next phase.

## 🎯 Product scope

DayFlow owns daily plans, execution tracking, reminders, daily review, and memory. It references identifiers from To-Do and Timetable instead of creating duplicate authoritative records.

## ✨ Current capabilities

- 🌊 Daily orchestration UI
- ✅ Execution/result tracking
- 🔔 Reminder model
- 🧠 Daily memory
- 🔥 Firestore persistence and synchronization
- 💾 Local recovery/cache layer
- 🔐 Firebase Authentication and email verification
- 🛡️ Shared PALMI-D3V app-access gate
- 🔗 Read-only To-Do bridge
- ✉️ Shared weekly-summary backend source
- 🚪 Consistent Sign out UX

## 🛠️ Technology

| Technology | Role |
| --- | --- |
| React | UI/application layer |
| Vite | Development/build tooling |
| Tailwind CSS | Styling |
| Firebase Auth | Identity |
| Cloud Firestore | Cloud persistence |
| Vitest | Tests |
| ESLint | Code quality |

## 🧱 Data ownership

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

To-Do remains authoritative for tasks. Timetable remains authoritative for recurring schedules and occurrences.

## 📁 Repository structure

~~~text
dayflow-palmid3v/
├── .github/              # CI
├── app/
│   ├── src/              # Active DayFlow application
│   ├── docs/             # Product/architecture documentation
│   ├── CONTEXT.md        # Existing app-level context
│   └── README.md         # App-level implementation notes
├── CONTEXT.md            # Repository-level source context
└── README.md             # Project entry point
~~~

## 📚 Documentation

Key documentation remains under app/docs/, including phases, access control, Firebase architecture, integrations, roadmap, tasks, and release notes.

## 🚀 Development

~~~bash
cd app
npm install
npm run dev
npm run lint
npm run build
~~~

## 📌 Project boundary

DayFlow does not own task persistence or recurring timetable persistence. External calendar and email delivery remain integration concerns.

## 📚 Project context

See CONTEXT.md for the consolidated project context and current architectural rules.

---

**PALMI-D3V** · DayFlow · 2026