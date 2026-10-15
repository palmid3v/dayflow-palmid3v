# DayFlow Unification Audit — October 2026

## Decision

DayFlow is the canonical application. To-Do and Timetable become internal DayFlow domains, not separately launched runtime applications. Keep their repositories read-only as migration/rollback evidence until data, deployments, access rules, and historical records are verified.

Audited sources: the main branches of palmid3v/dayflow-palmid3v, palmid3v/timetable-palmid3v, and palmid3v/to-do-palmid3v, including root READMEs, app package manifests, core app entry files, Firebase configuration and Firestore Rules. This is a source-level audit; no local end-to-end run or live Firebase deployment was performed for this document.

## Findings

### DayFlow — host application

- React 19, Vite 7, Tailwind CSS 4, Firebase JS SDK, PWA support, Lucide icons, ESLint.
- Already owns daily planning, schedule/calendar blocks, reminders, execution tracking, daily review and written memory.
- Has CI/release validation tooling: static validation, CVP tests, Playwright E2E and a release validation runner.
- Has a feature-oriented structure under app/src/features, shared domain/lib code, and an established Firebase Auth boundary.
- Current README says To-Do and Timetable are migration/rollback sources, not runtime dependencies. This target direction is sound.
- The current application still contains transition-era task and access compatibility logic. Confirm all code paths and deployment settings before removing that compatibility.

### To-Do — task domain

- React 19, Vite 7, Tailwind CSS 4, Firebase Auth/Firestore, Lucide, PWA baseline.
- Owns create/edit/complete/delete, task lifecycle, filters, local recovery and Firestore synchronization.
- Canonical task collection is users/{uid}/tasks/{taskId}; consumers should reference task IDs instead of storing duplicate task records.
- Its app UI is visually distinct from DayFlow and should not be copied wholesale. Migrate the task domain behavior, validated data contract, test cases and useful UX states into DayFlow's existing task feature.
- Task record shape in To-Do is richer in the local app than its compact Firestore serializer. Verify all required fields and legacy records before final schema normalization.

### Timetable — recurring schedule domain

- React 19, Vite 8, Tailwind CSS 4, Firebase Auth/Firestore, PWA, Vitest.
- Owns recurring templates, occurrences, settings, external links and recurring ICS export.
- Firestore collections are users/{uid}/timetableTemplates, timetableOccurrences, timetableSettings, and timetableExternalLinks.
- Its root firebase.json also references a functions/ backend for weekly summary delivery. That backend and its deployment/secrets are operational assets and require an explicit owner before the legacy repository is retired.
- Dependency versions differ from DayFlow. Do not merge lockfiles or upgrade the host toolchain as a side effect of feature migration.

## Main risks / required controls

1. **Firestore Rules drift.** The three rule sets have different access models and legacy application IDs. DayFlow's current rules use a feature-level DayFlow access model and permit a few legacy paths; Timetable's rules separately accept app IDs for timetable/todo/dayflow. Consolidate to one reviewed rule set, then test owner isolation, verified-email access, feature access, admin paths, and denied-by-default behavior with the Firebase Rules Unit Testing SDK.
2. **Data path drift.** New DayFlow data uses flat user subcollections such as dayflowPlans and dayflowResults; Timetable's older rules also contain nested users/{uid}/dayflow/plans, results, memories, and reminders paths. Inspect actual Firestore data before migrating or deleting any path.
3. **Authentication and access parity.** One Firebase identity does not imply every feature is authorized. Every feature must check the DayFlow app access and its specific feature flag, with Rules remaining authoritative.
4. **Task data loss or duplication.** Keep users/{uid}/tasks canonical. Avoid a second DayFlow task store; reference task IDs from schedule blocks and daily plans.
5. **Local/cache conflict behavior.** LocalStorage recovery and Firestore synchronization exist in multiple implementations. Define a single conflict policy and tests before removing the old code.
6. **Weekly summary backend.** Determine whether the deployed Firebase Function and Resend configuration are still active, where they are deployed, and which repository owns the production source before moving it.
7. **Release and deployment drift.** Record active Vercel projects, domains, environment variable names (not values), Firebase project/database/region, deployed Rules version, scheduled functions, and rollback procedure. Do not claim migration complete on source changes alone.
8. **PWA/service worker.** Check cache names and update behavior so an old standalone app does not keep serving obsolete assets after consolidation.

## Recommended target architecture

text
DayFlow (one React/Vite/PWA application)
├── shell: navigation, auth gate, route/layout, settings
├── Today: daily plan, block execution, review
├── Tasks: authoritative users/{uid}/tasks documents
├── Schedule: templates, occurrences, settings, ICS export
├── Reminders: reminders and notification preferences
├── Calendar: day view and imported-event adapters
├── Memory: daily results and written notes
└── shared infrastructure
    ├── Firebase Auth boundary
    ├── Firestore repositories + validated data contracts
    ├── access/feature policy
    ├── local recovery/sync policy
    └── validation/release gates

Firebase remains the identity and persistence layer. Keep all data user-scoped. Keep privileged operations, secrets, and administrative authority out of the browser client.

## Migration sequence

1. **Inventory and freeze:** tag the three source revisions; export Firestore data and record deployments, env names (not values), rules, indexes, and Functions schedules.
2. **Contract first:** document the canonical task, timetable, occurrence, settings, reminder, plan, result, and memory shapes. Add runtime validation at persistence boundaries.
3. **One auth/access contract:** reuse DayFlow Auth; merge access decisions into one documented feature policy and one Rules set. Add emulator tests for allow/deny cases.
4. **Merge feature domains:** migrate timetable UI/services and To-Do behavior into DayFlow feature folders, reusing DayFlow shell and shared components. Preserve ICS export and valuable migration/recovery logic.
5. **Data reconciliation:** compare legacy schemas, perform idempotent migrations only where needed, maintain a backup and produce counts/checksums or equivalent reconciliation evidence.
6. **Automated proof:** lint, unit/domain tests, Rules tests, CVP, production E2E, build, PWA/offline checks, keyboard/responsive accessibility, and reduced-motion verification.
7. **Human IPV:** sign in with least-privilege test accounts and manually verify every primary flow on desktop and mobile.
8. **Release and rollback:** deploy to a preview/staging environment first, verify live Auth/Firestore/Functions, then release. Keep source repos and old deployments until the acceptance checklist passes.
9. **Retire last:** only archive/disable legacy production routes after usage, deployment, data and rollback checks are documented.

## Acceptance gates

- [ ] Sign in, sign out, verified-email state and pending/suspended access work as designed.
- [ ] A user cannot read/write another user's documents.
- [ ] Feature flags are enforced in UI and Firestore Rules.
- [ ] Tasks create/edit/complete/delete/filter; no duplicate task source.
- [x] Recurring template overlap warnings and explicit save-anyway flow implemented in DayFlow Schedule.
- [x] Recurring timetable ICS export added with valid RFC weekday codes.
- [ ] Occurrence-level overrides/history, colors and all legacy schedule settings are reconciled and validated.
- [ ] Day plan, reminders, daily review and memory persist across refresh and device sessions.
- [ ] Offline/local recovery does not silently overwrite newer cloud data.
- [ ] Weekly summary/function delivery is either proven operational or explicitly disabled/documented.
- [ ] PWA update and cache invalidation verified.
- [ ] CVP, unit, Rules, E2E, build, accessibility and manual IPV evidence recorded.
- [ ] Export/backup and rollback procedure tested.

## Audit conclusion

Consolidation is the right direction and much of the DayFlow foundation already exists. The highest-risk work is not visual merging; it is consistent Firestore authorization, data-path/schema reconciliation, task ownership, sync behavior and deployment/function ownership. Preserve the legacy repositories until those checks pass.
