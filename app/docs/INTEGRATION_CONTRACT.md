# DayFlow Internal Domain Contract — Unified Product

**Version:** 2.0 · Consolidation work in progress · October 15, 2026

This document supersedes the old DayFlow ↔ To-Do browser bridge contract. DayFlow is the single application. Tasks and recurring schedules are internal DayFlow features backed by the same Firebase identity and Firestore database.

## Capability ownership

| Capability | Runtime owner | Canonical data |
|---|---|---|
| Tasks: create, edit, complete, delete, filters | DayFlow Tasks module | users/{uid}/tasks/{taskId} |
| Recurring schedule templates | DayFlow Schedule module | users/{uid}/timetableTemplates/{templateId} |
| Daily plans and execution states | DayFlow Today | users/{uid}/dayflowPlans/{dateKey} |
| Daily results and review | DayFlow Memory / Today | users/{uid}/dayflowResults/{dateKey} |
| Daily memory | DayFlow Memory | users/{uid}/dayflowMemories/{dateKey} |
| Reminders | DayFlow Reminders | users/{uid}/dayflowReminders/current |
| Imported calendar snapshot | DayFlow Calendar | users/{uid}/dayflowCalendarImports/current and dayflowImportedCalendarEvents |

Legacy collections such as timetableOccurrences, timetableSettings and timetableExternalLinks may contain existing records. Do not delete, rename or silently ignore them until their actual production usage has been inventoried.

## Runtime integration

- One React/Vite/PWA frontend and one Firebase Authentication session.
- No popup, iframe, postMessage task bridge or second frontend is required for normal DayFlow operation.
- A daily plan may reference a task ID or schedule-template ID; do not create a second authoritative task document.
- LocalStorage is a cache/recovery layer, not a competing cloud source of truth.
- Firestore Rules enforce user ownership and feature-level access. Hiding a module in the UI is not a security control.

## Legacy task compatibility

Older To-Do records may use a compact schema containing title, completed, createdAt and updatedAt. Current DayFlow task records also support description, status, priority, dueDate, scheduledTime, category and tags. Migration must preserve available fields, normalize older aliases, and never overwrite non-empty data with defaults without an explicit reconciliation rule.

## Legacy schedule compatibility

Timetable stores days as short text IDs such as mon, tue and sun; DayFlow uses JavaScript weekday numbers (Sunday = 0). Normalize these fields explicitly. New writes retain a mapped day string temporarily for compatibility with legacy readers. Invalid or unknown days must be rejected rather than defaulted to Sunday.

Schedule exports use RFC 5545 weekday codes (SU, MO, TU, WE, TH, FR, SA). Verify generated .ics files against representative calendar clients before treating exports as release-accepted.

## Migration procedure

1. Record source commit SHAs and export/backup existing user data before any production data change.
2. Inventory real Firestore paths, document counts and field shapes; do not infer deployed state from code alone.
3. Normalize and validate data with an idempotent migration. Retain original IDs and preserve recoverable legacy fields.
4. Reconcile source/destination counts and representative records before switching readers.
5. Test ownership isolation, email verification, feature-level allow/deny cases, sign-in/out and recovery behavior in the Firebase Emulator Suite.
6. Keep To-Do and Timetable repositories and deployments available as rollback sources until production acceptance is recorded.

## Strict $0 operating policy

- Keep Auth and Firestore within their free quotas and monitor usage.
- Do not require a paid service for core planning, tasks, schedule, memory or browser notifications.
- Browser notifications work only when the browser/platform grants permission; the current client timer is not a guaranteed background-delivery service.
- Timetable's old scheduled weekly email uses Cloud Functions and Resend configuration. It is not part of the DayFlow runtime path. Under a strict $0 requirement, do not deploy or depend on that delivery path; provide an on-demand in-app summary instead.

## Release contract

Consolidation is complete only after Rules tests, unit tests, lint, build, authenticated CVP/E2E, responsive/accessibility checks, PWA update checks, production smoke evidence, data reconciliation and a tested rollback plan pass. A skipped test is not a pass.