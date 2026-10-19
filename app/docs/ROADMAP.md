# Roadmap — DayFlow

## Unified product foundation

- [x] Daily planning and execution states
- [x] Native task feature
- [x] Native recurring schedule feature
- [x] Calendar ICS import
- [x] Reminders and browser notification prototype
- [x] Daily review and memory
- [x] Dashboard / analytics
- [x] Admin / access manager
- [x] Responsive baseline and PWA foundation
- [x] DayFlow-owned Firestore model
- [x] Feature-aware access model and release validation tooling

## Product usability milestone — target 80%

- [x] Keep Today as a read-only daily overview; route task changes to Tasks and reminder changes to Reminders.
- [x] Show open tasks above completed tasks in the Today queue and label tasks due on the selected day.
- [x] Keep daily blocks and reminders in Today read-only to avoid duplicate management surfaces.
- [x] Show task totals, open tasks and overdue work in Dashboard.
- [x] Add deterministic unit coverage for task completion/reopen state transitions.
- [x] Bring .ics calendar import to the top of Schedule, with clear access-state messaging when Calendar is not enabled.
- [ ] Record a fresh CI run for the consolidated `main` commit (unit, lint, production build and PWA).
- [ ] Verify task create/complete/reopen persistence against the authenticated Preview.
- [ ] Complete schedule, reminder and daily-review smoke tests across desktop and mobile.
- [ ] Close Firebase Rules Emulator, migration/backup, authenticated E2E, PWA cache and rollback gates.

## Current hardening — in progress

- [x] Document the single-app target and legacy repository retirement criteria
- [x] Add tests for migration of legacy Timetable day IDs to DayFlow weekdays
- [x] Add recurring .ics schedule export with valid weekday codes
- [x] Add same-day overlap detection and an explicit save-anyway confirmation
- [x] Tighten schedule-collection access to the Schedule feature policy
- [x] Define initial retro-dark color/motion tokens and responsive desktop shell
- [x] Apply and visually review Dark Premium refinements across Today, Dashboard, Tasks, Schedule, Memory and Settings
- [x] Fix Settings modal viewport positioning so it remains centered independently of page scroll
- [ ] Reconcile actual production Firestore records and contradictory legacy schedule fields
- [x] Add Firestore Rules allow/deny test harness and `test:rules` script; local Emulator Suite run passed 6/6 rules tests on 2026-10-19.
- [ ] Decide the fate of the Timetable weekly-summary Cloud Function under the strict $0 budget
- [ ] Prove task and schedule migrations are idempotent and lossless against backups
- [ ] Run authenticated CVP and full Playwright E2E; configure dedicated QA credentials safely
- [ ] Verify the deployed site manually at mobile/tablet/desktop sizes, with keyboard and reduced motion
- [ ] Review PWA/service-worker cache updates and stale-client behavior
- [ ] Produce release evidence and rollback instructions before archiving legacy repositories

## Validation platform

- [x] Machine-readable DayFlow validation profile
- [x] Profile validator and structural checks
- [x] V0–V8 validation model
- [x] CVP vs E2E distinction
- [x] Interactive Product Verification (IPV) and Interactive Smoke Test (IST)
- [x] Legacy repository retirement procedure

## Quality follow-ups

- [x] Split Firebase vendor chunks and verify build output: app entry 300.34 kB, Firestore 391.66 kB, Auth 78.76 kB and shared Firebase 79.48 kB; no oversized-chunk warning (local build).
- [ ] Remove Node DEP0190 warning from Windows validation runner without weakening process isolation.
- [ ] Resolve or explicitly document existing React Hooks dependency warnings.
- [ ] Add durable validation report artifacts for local and CI runs.

## Product principle

DayFlow coordinates the day without becoming a second task database or calendar source of truth. One application, one Firebase identity, user-scoped data, and no mandatory paid service.

## Documentation checkpoint — 2026-10-19

Local validation on the current hardening work: the full Node test suite passed **33/33**, including **6/6 Firestore Rules tests** under `firebase emulators:exec --only firestore --project demo-dayflow "npm --prefix app test"`; `npm --prefix app run lint` passed; and `npm --prefix app run build` passed with PWA service-worker generation. These are local results, not a substitute for a fresh CI run or production acceptance. The latest full-suite run occurred before the final E2E branch cleanup; rerun lint, build and the full suite against the final consolidated `main` commit to close that evidence gap. Today is intentionally read-only; task and reminder mutations live in their dedicated modules. Remaining focus: dependency audit remediation, production data reconciliation, migration proof, authenticated CVP/E2E, manual IPV/IST, PWA update behavior, and release/rollback evidence. Reconcile production records before any migration or legacy retirement. Do not treat undocumented or unexecuted gates as passed.
