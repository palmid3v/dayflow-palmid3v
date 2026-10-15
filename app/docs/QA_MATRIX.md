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

GitHub Actions run [38810853829](https://github.com/palmid3v/dayflow-palmid3v/actions/runs/38810853829) validated commit `0a04d0e15970975dd004ee48ab9ec95b375648ba`: Unit **26/26 PASS**, Lint **PASS**, production build **PASS**, and PWA generation **PASS**. That build still warned about an application chunk over 500 kB. The branch now tests Firebase vendor-chunk splitting, so use the newest CI result before release.

- CVP: **SKIP** when QA credentials are not configured.
- Authenticated production E2E: **SKIP** when QA credentials are not configured.
- Firestore Rules Unit Testing in the Emulator Suite: pending.
- Production data reconciliation and migration proof: pending.
- Manual IPV/IST for desktop/mobile, keyboard, reduced motion and PWA update behavior: pending.

A skipped test is not a pass. A green static CI run is not production acceptance.

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