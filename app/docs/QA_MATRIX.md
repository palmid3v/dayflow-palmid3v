# DayFlow QA Matrix

## Validation model

| Level | DayFlow implementation |
|---|---|
| V0 Repository Contract | Validate-CVPProfile.ps1 |
| V1 Domain Validation | npm test |
| V2 Static Quality | npm run lint |
| V3 Build / Artifact | npm run build + PWA generation |
| V4 Integration | Firebase/auth/access checks |
| V5 CVP | npm run test:cvp |
| V6 E2E | npm run test:e2e |
| V7 IPV / IST | Human or agent interactive UI verification |
| V8 Production Acceptance | deployment + smoke + PWA/responsive + rollback evidence |

## Automated validation

Run:

    cd app
    npm ci
    npm run validate:static

With a dedicated QA account:

    npm run validate

Current automated suite:

- Unit: 11/11 tests.
- Lint: 0 errors; warnings are reported.
- Production build: PASS.
- PWA generation: PASS.
- CVP: PASS.
- Full production E2E: PASS.

## Critical Value Path

The DayFlow CVP protects the highest-value flows:

- authentication/session access;
- Today block lifecycle;
- Tasks lifecycle;
- Dashboard visibility.

The automated scenarios live in app/e2e/cvp.spec.mjs.

## Full production E2E

The production E2E covers:

- authentication and Today;
- Today block CRUD;
- Tasks CRUD;
- Schedule CRUD;
- calendar .ics import/clear;
- reminders and notification behavior;
- Daily Memory;
- Dashboard;
- Admin Access Manager;
- Settings/session controls;
- browser/runtime error collection.

The scenarios live in app/e2e/dayflow.spec.mjs.

## Interactive Product Verification (IPV)

IPV is the process used when automated assertions cannot fully prove the user experience.

A focused IPV run is an Interactive Smoke Test (IST).

For DayFlow:

### Authentication

- [ ] Open the approved Preview.
- [ ] Open the approved Production deployment.
- [ ] Authenticate with the dedicated QA account.
- [ ] Confirm expected access/verification state.
- [ ] Sign out and confirm the authentication screen returns.

### Primary interaction

- [ ] Open Today.
- [ ] Press the primary Play/start action when present.
- [ ] Confirm the expected active state appears.
- [ ] Perform a representative block interaction.
- [ ] Confirm the visible state changes.
- [ ] Refresh when persistence is part of the scenario.

### Tasks / Schedule

- [ ] Create, edit, complete, and delete a representative task.
- [ ] Create, edit, duplicate, and delete a representative schedule block.
- [ ] Confirm controls remain usable at narrow/mobile widths.

### Calendar / Reminders / Memory

- [ ] Import a valid .ics fixture.
- [ ] Confirm imported events appear correctly.
- [ ] Clear the imported snapshot.
- [ ] Create/complete a reminder.
- [ ] Verify notification behavior when supported.
- [ ] Save and reload Memory.
- [ ] Confirm Dashboard reflects the current state.

### PWA / responsive

- [ ] Verify desktop layout.
- [ ] Verify mobile layout without horizontal overflow.
- [ ] Verify touch-friendly controls.
- [ ] Verify PWA installation/runtime.
- [ ] Verify refreshed routes use the expected service-worker fallback.
- [ ] Verify reduced-motion behavior where relevant.

## Production evidence

Record:

- Production URL.
- Release commit SHA.
- Vercel deployment result.
- Firebase rules deployment result.
- Automated validation result.
- CVP/E2E result.
- IPV/IST result.
- Known warnings/exceptions.

## Release exit criteria

A release is ready when required automated checks, CVP/E2E, IPV/IST, deployment evidence, security/configuration checks, and rollback evidence are complete.
