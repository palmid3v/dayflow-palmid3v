# CONTEXT — DayFlow

## Identity

- Product: DayFlow
- Ecosystem: PALMI-D3V productivity suite
- Role: Single productivity application and center of operations
- Developer: PALMI-D3V
- Last context review: 2026-10-15

## Product architecture

DayFlow is the only intended runtime productivity application. Tasks, recurring schedule, daily planning, calendar imports, reminders, review, dashboard and memory are internal modules in one React/Vite/PWA application.

To-Do and Timetable remain migration/rollback sources until functionality, actual Firestore data, permissions, deployed functions, domains and history have been reconciled. Do not delete them during feature integration.

## Canonical data model

One Firebase Authentication identity and one Cloud Firestore project. User data must remain scoped to users/{uid}.

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

Firestore is the cloud source of truth. LocalStorage is a cache/recovery layer. Tasks remain in one canonical collection and other domains reference task IDs instead of duplicating task documents.

## Engineering constraints

- Budget target: $0 mandatory service spend.
- Firebase Auth and Cloud Firestore remain the identity/persistence backend.
- Do not depend on scheduled Cloud Functions/Resend email delivery under the strict $0 requirement; prefer an on-demand in-app summary.
- Do not add libraries for animations that simple CSS transitions can provide.
- Respect reduced-motion preferences, visible keyboard focus, mobile-safe touch targets and readable contrast.
- Treat production Firestore migration and Rules deployment as controlled changes with backups, emulator tests and rollback.
- Keep legacy repositories available until the new release has passed data, security, E2E, PWA and production acceptance.

## Branch/release note

PR #30 is an unmerged draft proposing consolidation hardening and retro-dark UI work. The default branch remains canonical until the PR is accepted. Its static CI has passed, but authenticated CVP/E2E were skipped because QA credentials were not configured.

## Development

    cd app
    npm ci
    npm run dev
    npm run test
    npm run lint
    npm run build
    npm run validate:static

## Documentation checkpoint — 2026-10-18

README.md actualizado como destino canónico de productividad. Unificación sigue abierta hasta reconciliar datos históricos, permisos, funciones/despliegues, autenticación E2E y rollback. No retirar To-Do/Timetable antes de cerrar esas puertas. Mantener el objetivo operativo de $0.

Status labels describe the latest documented evidence, not a guarantee that every workflow is complete. Update this checkpoint when new validation results arrive.