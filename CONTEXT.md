# CONTEXT — DayFlow

## Identity

- Product: DayFlow
- Ecosystem: PALMI-D3V productivity suite
- Role: Single productivity application and center of operations
- Developer: PALMI-D3V
- Last context review: 2026-10-19

## Product architecture

DayFlow is the only intended runtime productivity application. Tasks, recurring schedule, daily planning, calendar imports, reminders, review, dashboard and memory are internal modules in one React/Vite/PWA application.

To-Do and Timetable remain migration/rollback sources until functionality, actual Firestore data, permissions, deployed functions, domains and history have been reconciled. Do not delete or disable them during feature integration.

## Canonical data model

One Firebase Authentication identity and one Cloud Firestore project. User data must remain scoped to `users/{uid}`.

```
users/{uid}/tasks/{taskId}
users/{uid}/timetableTemplates/{templateId}
users/{uid}/timetableOccurrences/{occurrenceId}   # legacy inventory required
users/{uid}/timetableSettings/{document}           # legacy inventory required
users/{uid}/timetableExternalLinks/{document}      # legacy inventory required
users/{uid}/dayflowPlans/{dateKey}
users/{uid}/dayflowResults/{dateKey}
users/{uid}/dayflowMemories/{dateKey}
users/{uid}/dayflowReminders/current
users/{uid}/dayflowCalendarImports/current
users/{uid}/dayflowImportedCalendarEvents/{eventId}
```

Firestore is the cloud source of truth. LocalStorage is a cache/recovery layer. Tasks remain in one canonical collection and other domains reference task IDs instead of duplicating task documents.

## Engineering constraints

- Budget target: $0 mandatory service spend.
- Firebase Auth and Cloud Firestore remain the identity/persistence backend.
- Do not depend on scheduled Cloud Functions/Resend email delivery under the strict $0 requirement; prefer an on-demand in-app summary unless the owner explicitly changes the budget decision.
- Do not add animation libraries when CSS transitions suffice.
- Respect reduced-motion preferences, visible keyboard focus, mobile-safe touch targets and readable contrast.
- Treat production Firestore migration and Rules deployment as controlled changes with backups, emulator tests and rollback.
- Keep legacy repositories available until the new release has passed data, security, E2E, PWA and production acceptance.
- Work directly on `main`; do not create additional branches unless the owner explicitly changes this instruction.

## Current Git and validation baseline

- Latest reported commit: `2877bff` — `fix: update vulnerable grpc dependency`.
- The commit was pushed to `origin/main`; the user confirmed `main` is synchronized and the working tree is clean.
- `@grpc/grpc-js` is pinned through npm overrides to `1.14.6`; `npm audit` reports 0 vulnerabilities.
- Full local Node suite: 33/33 passed, including 6/6 Firestore Rules tests through the Firestore emulator.
- ESLint and production build passed; PWA service-worker generation completed.

## Phase 2 — Build

Phase 2 is the active work focus. Start with canonical data contracts and persistence boundaries, then verify core CRUD/session persistence, schedule compatibility, local/cloud conflict behavior, and production-data inventory. Keep feature work moving; production migration, legacy retirement and release remain gated on backup/reconciliation, authenticated CVP/E2E, manual IPV/IST, PWA update and rollback evidence.

## Development

```powershell
npm --prefix app install
npm --prefix app run lint
npm --prefix app run build
firebase emulators:exec --only firestore --project demo-dayflow "npm --prefix app test"
```

Run these validations again when the relevant code changes or when investigating a regression; do not repeatedly reopen a completed baseline without a reason.

## Documentation rule

Record only evidence that exists. Separate confirmed local automated results from production acceptance. Update `app/docs/ROADMAP.md` and `app/docs/QA_MATRIX.md` when Phase 2 work changes the scope or status. Keep this file aligned with the current `main` commit and next actionable task.
