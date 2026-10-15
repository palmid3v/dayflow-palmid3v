# DayFlow — Application

DayFlow is the single application for PALMI-D3V productivity. To-Do and Timetable are legacy migration/rollback sources, not runtime applications.

## Product modules

- **Today:** daily plan, chronological blocks, execution state and review.
- **Tasks:** task lifecycle, priorities, due dates, completion and filters.
- **Schedule:** recurring templates, time blocks and schedule-to-day conversion.
- **Calendar:** ICS import and event display.
- **Reminders:** browser notifications while the application is open.
- **Memory:** daily result and note.
- **Dashboard:** summary of personal activity.
- **Settings / access:** Firebase session and feature-level access.

## Data ownership

Firebase Authentication is the identity boundary. Cloud Firestore is the cloud source of truth, scoped by user ID. LocalStorage is a cache/recovery layer and must not become a competing authoritative database.

Canonical collections currently used by DayFlow include:

    users/{uid}/tasks/{taskId}
    users/{uid}/timetableTemplates/{templateId}
    users/{uid}/timetableOccurrences/{occurrenceId}
    users/{uid}/timetableSettings/{document}
    users/{uid}/timetableExternalLinks/{document}
    users/{uid}/dayflowPlans/{dateKey}
    users/{uid}/dayflowResults/{dateKey}
    users/{uid}/dayflowMemories/{dateKey}
    users/{uid}/dayflowReminders/{documentId}
    users/{uid}/dayflowCalendarImports/{documentId}
    users/{uid}/dayflowImportedCalendarEvents/{eventId}

Do not rename or delete legacy paths until the deployed backend and actual stored records have been inventoried. Reconcile schema differences explicitly and keep migrations idempotent.

## Architecture

    src/
    ├── components/    # auth and shared access UI
    ├── features/
    │   ├── calendar/
    │   ├── dashboard/
    │   ├── memory/
    │   ├── reminders/
    │   ├── schedule/
    │   └── tasks/
    ├── domain/        # daily plan/result/memory models
    └── lib/           # Firebase, access and DayFlow persistence

## Development

    npm install
    npm run dev
    npm run lint
    npm test
    npm run build

## Current release status

The unification target is DayFlow. Before retiring the legacy repositories, verify real Firestore data, feature-level security rules, the former weekly-summary function, production environment configuration, authenticated E2E, PWA update behavior and rollback evidence. A successful static CI run alone is not production acceptance.

See docs/audits/UNIFICATION-AUDIT-2026-10.md, docs/design/RETRO-DARK-DESIGN-SYSTEM.md, docs/QA_MATRIX.md and docs/RELEASE_CHECKLIST.md.