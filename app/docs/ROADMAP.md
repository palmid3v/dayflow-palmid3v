# Roadmap — DayFlow

## Product direction

DayFlow is the single productivity application in the PALMI-D3V ecosystem. It brings Today, Tasks, Schedule, Calendar imports, Reminders, Dashboard, Memory and access management into one React/Vite/PWA application backed by Firebase Authentication and Cloud Firestore.

Product principles:
- One application and one Firebase identity.
- `users/{uid}/tasks/{taskId}` remains the canonical task store; other domains reference task IDs instead of duplicating task documents.
- Firestore is the cloud source of truth; local storage is a recovery/cache layer.
- Enforce user isolation and feature access in Firestore Rules, not only in the UI.
- Preserve the $0 mandatory-service budget; do not introduce paid services as a default dependency.
- Keep To-Do and Timetable repositories/deployments as migration and rollback evidence until data and operational ownership are reconciled.

## Phase 1 — Foundation and hardening

**Status: complete for the current local automated validation and dependency-hardening scope.** The application foundation, consolidated modules, access policy, rules-test harness, usability adjustments, production build and dependency override are in place.

- [x] Daily planning and execution states.
- [x] Tasks feature and task completion/reopen behavior.
- [x] Recurring Schedule feature, overlap warning and explicit save-anyway flow.
- [x] Calendar `.ics` import and recurring schedule export.
- [x] Reminders, daily review and Memory.
- [x] Dashboard and admin/access manager.
- [x] Responsive baseline, PWA generation and Dark Premium shell.
- [x] DayFlow-owned Firestore model and feature-aware access policy.
- [x] Firestore Rules allow/deny test harness.
- [x] Local test suite: **33/33 passed**, including **6/6 Firestore Rules tests**.
- [x] ESLint passed.
- [x] Production build and PWA service-worker generation passed.
- [x] Dependency remediation: `@grpc/grpc-js` overridden to `1.14.6`; `npm audit` reports **0 vulnerabilities**.
- [x] Commit `2877bff` pushed to `origin/main`; local working tree clean at the last reported check.

## Phase 2 — Build

**Status: ready to start.** Focus on making the consolidated product reliable end-to-end and closing data-contract gaps while continuing feature work directly on `main`. Do not reopen completed local validation tasks unless a change requires rerunning them.

### Workstream 2.1 — Canonical data contracts
- [ ] Document and verify canonical schemas for tasks, schedule templates, occurrences, settings, day plans/results, reminders, calendar imports and memories.
- [ ] Identify legacy aliases and compatibility paths; add explicit normalization/validation at persistence boundaries.
- [ ] Keep task documents canonical and reference task IDs from other domains.
- [ ] Define conflict-resolution rules for Firestore versus local recovery/cache; never silently overwrite newer cloud data.

### Workstream 2.2 — Persistence and domain behavior
- [ ] Confirm create/edit/complete/reopen/delete behavior and persistence for Tasks.
- [ ] Confirm Schedule template/occurrence behavior, overrides, history, settings and recurrence compatibility.
- [ ] Confirm day plan, reminders, daily review and Memory survive refresh and a second authenticated session/device.
- [ ] Verify import/clear behavior for `.ics` without deleting unrelated Schedule templates.
- [ ] Keep Today as a read-only overview; mutations belong to their owning modules.

### Workstream 2.3 — Access and data reconciliation
- [ ] Inventory actual production Firestore paths, document shapes, counts and contradictory legacy schedule fields before any migration.
- [ ] Confirm app access and feature flags are enforced by the deployed Rules.
- [ ] Prepare backup, idempotent migration plan, reconciliation evidence and rollback procedure before touching production data.
- [ ] Decide whether the legacy Timetable weekly-summary Cloud Function remains required under the $0 budget; document owner, deployment and secrets by name only.
- [ ] Do not retire To-Do/Timetable repositories, domains, functions or deployments until acceptance and rollback evidence exists.

### Workstream 2.4 — Product verification
- [ ] Run authenticated CVP and full Playwright E2E with dedicated QA credentials kept out of source control.
- [ ] Complete focused manual IPV/IST on desktop and mobile, including keyboard focus, reduced motion, error/empty/access-denied states and responsive overflow.
- [ ] Verify PWA installation, service-worker updates, stale-client behavior and recovery.
- [ ] Record release evidence and rollback instructions when preparing a deployment.

### Phase 2 exit criteria
- Canonical data contracts are documented and covered by tests.
- Core CRUD and persistence flows work for the authenticated user across refresh/session changes.
- User isolation and feature restrictions are verified against the intended Rules configuration.
- Production data has been inventoried and any migration is backed up, idempotent, reconciled and reversible.
- CVP/E2E and manual IPV/IST evidence is recorded.
- PWA update behavior and rollback procedure are verified before production release or legacy retirement.

## Validation reference

Use the scripts from `app/`:
- `npm run test` — domain/unit tests.
- `npm run lint` — static quality.
- `npm run build` — production build and PWA generation.
- `npm run test:rules` — Firestore rules tests; run with the Firestore emulator.
- `npm run test:cvp` — Critical Value Path.
- `npm run test:e2e` — full Playwright E2E.
- `npm run validate:static` and `npm run validate` — validation runner.

The confirmed local rules-suite command is:
`firebase emulators:exec --only firestore --project demo-dayflow "npm --prefix app test"`

## Product principle

DayFlow coordinates the day without becoming a second task database or calendar source of truth. One application, one Firebase identity, user-scoped data, and no mandatory paid service.

## Checkpoint — 2026-10-19

Current reported main commit: `2877bff` (`fix: update vulnerable grpc dependency`). Local validation passed: **33/33 tests**, including **6/6 Firestore Rules tests**; lint passed; production build and PWA generation passed; `npm audit` reported **0 vulnerabilities**. The dependency override is `@grpc/grpc-js@1.14.6`. The user confirmed the branch set is up to date and asked to move forward rather than repeat validation.

Phase 2 is now the active build focus. Production reconciliation, migration proof, authenticated CVP/E2E, manual IPV/IST, PWA update verification and release/rollback evidence remain release/data-safety gates; they do not prevent beginning Phase 2 product work. Never describe an unexecuted production gate as passed.
