# CONTEXT — DayFlow

## Identity

- Product: DayFlow
- Ecosystem: PALMI-D3V productivity suite
- Layer: Daily orchestration
- Developer: PALMI-D3V

## Purpose

DayFlow is responsible for daily plans, execution tracking, reminders, daily review, and memory. It references records owned by To-Do and Timetable instead of duplicating them.

## Current state

- Phase 1 product: complete
- Phase 2 UX/UI: complete
- Phase 3 architecture/data: complete
- Shared Firebase identity: implemented
- Email verification: implemented
- App-level access gate: implemented
- External integrations: next phase

## Data

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

## Current modules

- src/App.jsx
- src/lib/dayflowStore.js
- src/lib/dayflowCloudStore.js
- src/lib/todoAdapter.js
- src/domain/models.js
- src/lib/firebase.js
- src/lib/access.js

## Persistence

Cloud Firestore is the authenticated source of truth. Local DayFlow storage remains a recovery/cache layer when synchronization fails.

## Ecosystem contracts

- To-Do owns tasks.
- Timetable owns recurring schedules and occurrences.
- DayFlow orchestrates the user's day.
- Weekly summary data is consumed by the shared backend in the Timetable repository.

## Development

~~~bash
cd app
npm install
npm run dev
npm run lint
npm run build
~~~

## Documentation

See app/docs/ for phase, architecture, access, integration, roadmap, task, and release documentation.

## Rule for future work

New features must preserve data ownership boundaries and should not create duplicated authoritative task or timetable records.
