# DayFlow — Application Context

**Context date:** 2026-10-15
**Repository:** palmid3v/dayflow-palmid3v
**Default branch:** main
**Working consolidation branch:** feat/retro-dark-unification-hardening
**Pull request:** #30 (draft; not merged)

## Product decision

DayFlow is the single productivity application. To-Do and Timetable are legacy migration/rollback sources, not separate runtime dependencies. Their tasks and recurring schedule capabilities belong in DayFlow's existing feature modules.

## Modules

- Today: daily plan, chronological execution and review.
- Tasks: create/edit/complete/delete/filter/priority/due-date.
- Schedule: recurring templates, weekly/day view, duplicate/edit/delete, overlap confirmation and recurring .ics export.
- Calendar: local .ics import and imported-event display.
- Reminders: repeat rules and browser notifications while the app can run.
- Memory: daily result and notes.
- Dashboard: activity summary.
- Authentication/access: Firebase Auth, email verification, user/app state and feature permissions.

## Data model

Firebase Authentication is the identity boundary. Cloud Firestore is the cloud source of truth and data remains scoped by user ID. LocalStorage is used for caching and recovery.

Canonical/current paths include:

    users/{uid}/tasks/{taskId}
    users/{uid}/timetableTemplates/{templateId}
    users/{uid}/timetableOccurrences/{occurrenceId}   # legacy data: inventory before retirement
    users/{uid}/timetableSettings/{document}           # legacy data: inventory before retirement
    users/{uid}/timetableExternalLinks/{document}      # legacy data: inventory before retirement
    users/{uid}/dayflowPlans/{dateKey}
    users/{uid}/dayflowResults/{dateKey}
    users/{uid}/dayflowMemories/{dateKey}
    users/{uid}/dayflowReminders/current
    users/{uid}/dayflowCalendarImports/current
    users/{uid}/dayflowImportedCalendarEvents/{eventId}

Do not delete old nested paths or legacy schedule collections without checking actual production documents and deployed readers.

## Security

- Firestore Rules are authoritative; client-side feature gates are UX only.
- Task access must require tasks feature access (or an explicitly documented temporary legacy permission).
- Schedule templates, occurrences, settings and external links must use schedule feature access (or an explicitly time-bounded legacy path).
- User records must always be scoped to request.auth.uid.
- Administrative access is not created by a client-side role flag.

## $0 constraints

Do not add mandatory paid infrastructure. The former Timetable weekly email function depended on Cloud Functions and Resend; it is not a DayFlow runtime dependency. Under a strict zero-cost policy, use an on-demand in-app summary rather than requiring scheduled email delivery.

## Current work status

PR #30 is a draft. The current branch includes schedule-day migration normalization/tests, overlap warning/intentional-save behavior, recurring ICS export, Firestore Schedule-rule hardening, task persistence validation improvements, a retro-dark responsive desktop layout, and updated single-owner documentation.

Static CI previously passed (unit, lint, production build). CVP and authenticated E2E were skipped because required QA credentials were unavailable. Firestore Rules Emulator tests, real-data reconciliation, manual IPV, deployment verification and rollback evidence remain pending.

## Commands

From app/:

    npm ci
    npm run test
    npm run lint
    npm run build
    npm run validate:static

Full validation uses a dedicated QA account or a local Playwright auth state to run CVP and production E2E. Do not declare production-ready from source review or static CI alone.