# DayFlow QA Matrix

## Validation model

| Level | DayFlow implementation |
|---|---|
| V0 Repository Contract | Validate-CVPProfile.ps1 |
| V1 Domain Validation | npm test |
| V2 Static Quality | npm run lint |
| V3 Build / Artifact | npm run build + PWA generation |
| V4 Integration | Firebase/auth/access checks and Firestore Emulator Rules tests |
| V5 CVP | npm run test:cvp |
| V6 E2E | npm run test:e2e |
| V7 IPV / IST | Interactive verification by the responsible maintainer |
| V8 Production Acceptance | deployment + smoke + PWA/responsive + rollback evidence |

## Automated validation

Run from app/:

    npm ci
    npm run validate:static

With a dedicated QA account, or a valid local Playwright auth state:

    npm run validate

## Current status — consolidation branch

GitHub Actions run [38811104010](https://github.com/palmid3v/dayflow-palmid3v/actions/runs/38811104010) validated commit `111e7744e160a04d8ac174f3b36d820f4789588a`: Unit **26/26 PASS**, Lint **PASS**, production build **PASS**, and PWA generation **PASS**. Firebase vendor splitting passed without the previous oversized-chunk warning: app entry 295.78 kB, Firestore 391.66 kB, Auth 78.76 kB and shared Firebase 79.48 kB (minified sizes).

- CVP: **SKIP** when QA credentials are not configured.
- Authenticated production E2E: **SKIP** when QA credentials are not configured.
- Firestore Rules Unit Testing in the Emulator Suite: pending.
- Production data reconciliation and migration proof: pending.
- Manual IPV/IST for desktop/mobile, keyboard, reduced motion and PWA update behavior: pending.

A skipped test is not a pass. A green static CI run is not production acceptance.

## ICS calendar import checks

- [ ] With Calendar access enabled, open Schedule and see the Import .ics panel before editing recurring blocks.
- [ ] Import a valid .ics file and confirm event count, recurrence, and source filename are displayed.
- [ ] Confirm invalid files and files without events show a useful error without replacing the previous import.
- [ ] Confirm clearing the import removes only imported calendar events, not recurring Schedule templates.
- [ ] With Calendar access disabled, show an explicit access message rather than a missing/blank import area.

## Recent Today/Tasks/Dashboard usability checks

- [ ] Create a task from Today and confirm it appears in the task list after switching tabs.
- [ ] Complete and reopen a task from Today; confirm the status is consistent in Tasks.
- [ ] Simulate a task save failure and confirm the previous task list is restored with a visible error.
- [ ] Confirm Dashboard reports total, open and overdue tasks from the current user's task cache.
- [ ] Confirm high-priority and overdue labels are shown only when their conditions are true.
- [ ] Verify the quick-add task field and completion buttons with keyboard navigation and narrow viewport.

## Critical Value Path

The DayFlow CVP protects the highest-value flows:

- authentication/session access;
- Today block lifecycle;
- Tasks lifecycle;
- Dashboard visibility.

The automated scenarios live in app/e2e/cvp.spec.mjs.

## Full production E2E

The production E2E covers authentication and Today, Today block CRUD, Tasks CRUD, Schedule CRUD, calendar .ics import/clear, reminders/notification behavior, Daily Memory, Dashboard, Admin Access Manager, Settings/session controls, and browser/runtime error collection.

The scenarios live in app/e2e/dayflow.spec.mjs.

## Interactive Product Verification (IPV)

A focused IPV run is an Interactive Smoke Test (IST). It complements automated tests; it does not replace them.

### Authentication

- [ ] Open approved Preview and Production deployments.
- [ ] Authenticate with the dedicated QA account.
- [ ] Confirm expected email-verification and access states.
- [ ] Sign out and confirm the authentication screen returns.

### Primary flows

- [ ] Open Today and interact with a representative block.
- [ ] Confirm the visible state updates and survives refresh.
- [ ] Create/edit/complete/delete a representative task.
- [ ] Create/edit/duplicate/delete a schedule block.
- [ ] Verify overlap warning and the explicit save-anyway path.
- [ ] Export recurring schedules to .ics and import a sample .ics file.
- [ ] Create/complete a reminder and verify supported browser notifications.
- [ ] Save and reload Memory; confirm Dashboard reflects the current state.

### Quality and PWA

- [ ] Verify desktop layout at 1024px+ and narrow/mobile layout at 320px+.
- [ ] Verify no horizontal overflow and touch targets are usable.
- [ ] Navigate with keyboard only and confirm visible focus.
- [ ] Verify reduced-motion preference.
- [ ] Verify PWA installation, service-worker refresh and stale-cache update behavior.
- [ ] Inspect relevant loading/empty/error/disabled/access-denied states.

## Production evidence

Record production URL, release commit SHA, Vercel result, Firebase Rules deployment result, automated validation result, CVP/E2E result, IPV/IST result, known warnings/exceptions and rollback evidence.

## Release exit criteria

A release is ready only when the required automated checks, Rules tests, CVP/E2E, IPV/IST, deployment evidence, security/configuration checks, data reconciliation and rollback evidence are complete.