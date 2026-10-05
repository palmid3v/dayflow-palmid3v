# 🌊 DayFlow — PALMI-D3V Productivity

DayFlow is the **single productivity application** for the PALMI-D3V ecosystem.

Tasks, recurring schedules, daily planning, reminders, review, and memory live inside one React/Vite application backed by one Firebase Authentication identity and one Cloud Firestore database.

> **Current status:** Unified product architecture is implemented through Phases 1–12. DayFlow now includes the design/UX system, responsive mobile-first shell, installable PWA metadata, offline navigation support, admin analytics, audited access management, feature-aware cloud permissions, and browser reminder notifications while keeping local-first fallback behavior. To-Do and Timetable remain separate repositories only as migration/rollback sources; they are no longer runtime dependencies of DayFlow.

## Product modules

- 🏠 Today — daily orchestration
- ✅ Tasks — task creation, editing, completion, and lifecycle
- 🗓️ Schedule — recurring weekly timetable and imported calendar events
- 📥 Calendar Import — import standard `.ics` calendar snapshots without Google OAuth or Calendar API
- 🔔 Reminders — daily prompts, recurrence, overdue state, and optional browser notifications
- 🧠 Memory — daily review and history
- ⚙️ Settings — shared application configuration

## Architecture

```text
                         DAYFLOW
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
        TASKS            SCHEDULE          DAILY FLOW
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                    Firebase / Firestore
                            │
                        users/{uid}
```

### Firestore domains

```text
users/{uid}/tasks/
users/{uid}/timetableTemplates/
users/{uid}/timetableOccurrences/
users/{uid}/timetableSettings/
users/{uid}/timetableExternalLinks/

users/{uid}/dayflowPlans/
users/{uid}/dayflowResults/
users/{uid}/dayflowMemories/
users/{uid}/dayflowReminders/
users/{uid}/dayflowImportedCalendarEvents/
users/{uid}/dayflowCalendarImports/
accessAudit/ — immutable admin access-change audit records
```

There is one database, but each domain retains a clear responsibility.

## Repository structure

```text
dayflow-palmid3v/
├── app/
│   ├── src/
│   │   ├── components/      # shared UI and authentication
│   │   ├── features/
│   │   │   ├── tasks/        # Tasks domain
│   │   │   └── schedule/     # Schedule domain
│   │   ├── domain/           # DayFlow daily models
│   │   └── lib/              # shared Firebase + persistence
│   ├── docs/
│   └── package.json
├── firebase/
│   └── firestore.rules
├── CONTEXT.md
└── README.md
```

## Unified architecture rules

1. DayFlow is the only active frontend.
2. One Firebase project and one Firestore database.
3. One authentication system.
4. Tasks and schedules are internal DayFlow domains.
5. Calendar imports use standard `.ics` files; Google OAuth and the Google Calendar API are intentionally not required for the current release.
6. No popup or `postMessage` bridges between PALMI-D3V apps.
7. No duplicated authoritative records.
8. New productivity features become DayFlow modules.
9. Keep the file structure small and responsibility-driven.
10. External integrations are adapters, not sources of truth.
11. Admin access changes are audited and feature permissions are enforced at the Firestore boundary.
12. Vercel deployments should only run when the app directory changes.
13. The UI uses a dark-only visual system with shared design tokens and mobile-safe-area support.
14. PWA updates are automatic and the app keeps a local-first experience when cloud access is unavailable.

## Development

```bash
cd app
npm install
npm run dev
npm run lint
npm run build
```

## Migration repositories

The previous repositories remain untouched for now:

- `palmid3v/to-do-palmid3v`
- `palmid3v/timetable-palmid3v`

They are migration references and rollback sources until the unified DayFlow implementation is validated.

### Phases 11–12

- **Phase 11 — Design System / UX System:** centralized visual tokens, reusable surface/control patterns, focus states, motion preferences, and consistent responsive spacing.
- **Phase 12 — Responsive / PWA:** mobile-first navigation, safe-area handling, touch-friendly controls, install metadata, automatic service-worker updates, and SPA offline navigation fallback.

### Calendar import

DayFlow accepts `.ics` files directly in Schedule. Google Calendar supports exporting calendars as `.ics` files, including recurring-event data; the imported snapshot is stored in DayFlow and is not live-synchronized. Re-import the latest `.ics` file when the external calendar changes.

---

**PALMI-D3V · DayFlow · 2026**
