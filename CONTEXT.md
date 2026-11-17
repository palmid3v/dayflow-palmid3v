# CONTEXT — DayFlow

**Document review:** 2026-11-17  
**Repository:** `palmid3v/dayflow-palmid3v`  
**Owner:** PALMI-D3V  
**Product role:** Personal productivity application

## Purpose

DayFlow is the single PALMI-D3V productivity application. It unifies daily planning, tasks, recurring schedules, calendar events, reminders, reviews and personal memory in one responsive React/Vite PWA.

To-Do and Timetable are legacy migration/rollback sources, not separate DayFlow runtime modules. Preserve them until production data, permissions, deployed functions, history, backup and rollback have been reconciled and release acceptance is recorded.

## Product modules

- **Today:** daily plan, time blocks and execution status.
- **Tasks:** create, edit, prioritize, complete, reopen and organize personal tasks.
- **Schedule:** recurring schedule templates, occurrence management and overlap handling.
- **Calendar:** display and ICS import of calendar events.
- **Reminders:** browser notifications and in-app workflows subject to browser/runtime capabilities.
- **Daily Review and Memory:** review outcomes and retain daily personal notes.
- **Dashboard:** summaries of personal activity.
- **Settings and access:** Firebase session, preferences and feature-level access.

## Data ownership and architecture

- React 19, Vite 7, Firebase Authentication, Cloud Firestore and PWA.
- Playwright and Node tests support automated validation.
- Firestore is the cloud source of truth for authenticated user data, scoped to `users/{uid}`.
- LocalStorage is cache/recovery only, not an alternative authoritative store.
- Tasks have one canonical collection. Plans and other modules reference task IDs rather than duplicating task records.
- Firestore Rules enforce user ownership and feature access; hiding UI is not a security boundary.

## Ecosystem ownership

- DayFlow owns time, planning, tasks, calendar and reminders.
- Cupboard owns household/business inventory.
- Sandwichies owns commercial catalog, orders and customer operations.
- Financial-D3V owns private personal finance and encrypted vault files.

DayFlow may consume explicit minimized events to create planning signals; it must not maintain shadow inventory, order or financial ledgers.

## Operating constraints

- Maintain the $0 mandatory-service spend target.
- Do not add scheduled paid services or email delivery as required functionality without an explicit budget decision.
- Respect reduced motion, keyboard focus, readable contrast and mobile touch targets.
- Use Firebase Emulator for Rules and migration tests.
- No production mutation or legacy retirement without backup, reconciliation and rollback evidence.

## Product and QA status

Phase 1 — To-Do + Timetable unification — is accepted as closed by the user. This acceptance is separate from production migration or retirement of legacy repositories.

The latest cited CI checkpoint (report dated 2026-11-12; successful run on 2026-11-13) records 27/27 unit/domain tests, 6/6 Firestore Rules emulator tests, lint and production build/PWA passing. Authenticated CVP/E2E remains conditional on CI secrets. These are dated results, not a fresh run on 2026-11-17.

## Current priorities

1. Complete authenticated CVP/E2E using appropriate test credentials.
2. Verify task, schedule, reminder, memory and ICS persistence/recovery.
3. Inventory deployed Firestore paths and legacy data before migration.
4. Prepare backup, idempotent migration, reconciliation and rollback.
5. Validate accessibility, mobile behavior and PWA update lifecycle.
6. Keep Cupboard integration at the event/alert boundary; do not reimplement its inventory domain.

## Canonical documentation

- `app/docs/ROADMAP.md`
- `app/docs/QA_MATRIX.md`
- `app/docs/INTEGRATION_CONTRACT.md`
- `app/docs/audits/UNIFICATION-AUDIT-2026-10.md`
- `QUALITY-CHECKPOINT-2026-11-12.md`
- `app/README.md`

Preserve historical validation documents. Add new dated evidence rather than rewriting historical results as current.

---
**DayFlow · PALMI-D3V**
