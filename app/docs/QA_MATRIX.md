# DayFlow QA Matrix

## Automated coverage

The release validation suite covers the highest-risk pure domain behavior without requiring Firebase credentials:

- Daily result counters and memory summaries.
- Reminder creation, normalization, recurrence projection, completion dates, and sorting.
- ICS parsing, escaped text, recurrence COUNT, EXDATE, and all-day projection.

Run locally:

    cd app
    npm ci
    npm run test
    npm run lint
    npm run build

For production-readiness source/configuration checks:

    .\scripts\Validate-ProductionReadiness.ps1

## Manual release smoke test

Run this against a fresh Vercel Preview and the Production deployment after Firebase configuration is available.

### Authentication

- [ ] Sign up with a new test account.
- [ ] Verification email is sent.
- [ ] Unverified users remain on the verification screen.
- [ ] Verified users with no active DayFlow access see Access Denied.
- [ ] Admin users can open Access Manager.
- [ ] Sign out returns to the authentication screen.

### Access Manager

- [ ] User list loads.
- [ ] Search and status filters work.
- [ ] Status changes persist.
- [ ] Feature toggles persist.
- [ ] Audit activity is created for access changes.
- [ ] Non-admin users cannot access admin data.

### Today / Tasks / Schedule

- [ ] Today loads with empty-state content.
- [ ] A task can be created, edited, completed, and deleted.
- [ ] A recurring schedule block can be created, edited, duplicated, and deleted.
- [ ] Schedule blocks appear in the correct weekday.
- [ ] Task and schedule changes survive refresh.

### Calendar Import

- [ ] A valid .ics file imports.
- [ ] Recurring events project to the expected dates.
- [ ] Re-import replaces the previous snapshot.
- [ ] Clear removes imported events.
- [ ] Invalid .ics content produces a readable error.
- [ ] Calendar feature access blocks the import UI when disabled.

### Reminders / Memory / Dashboard

- [ ] A reminder can be created and completed.
- [ ] Reminder recurrence projects correctly.
- [ ] Browser notification permission can be requested.
- [ ] Memory can be saved and loaded.
- [ ] Dashboard metrics update from current DayFlow state.

### PWA / responsive

- [ ] Desktop layout remains usable.
- [ ] Mobile navigation is reachable without horizontal overflow.
- [ ] Task and schedule controls fit narrow screens.
- [ ] App can be installed as a PWA in a supported browser.
- [ ] A refreshed route loads through the service-worker navigation fallback.
- [ ] Reduced-motion preference is respected.

## Phase 16 production checks

### Vercel

- [ ] Project Root Directory is app.
- [ ] Approved main commit is deployed.
- [ ] Required production environment variables are configured.
- [ ] Production URL returns a successful HTTP response.
- [ ] Deployment is healthy and not rate-limited.

### Firebase

- [ ] Firebase CLI is authenticated.
- [ ] firebase deploy --only firestore:rules completes successfully from the approved release.
- [ ] Authentication works against Production.
- [ ] Firestore reads/writes succeed for an authorized user.
- [ ] Unauthorized feature access is rejected.

### Evidence

Record:

- Production URL.
- Release commit SHA.
- Vercel deployment result.
- Firebase rules deployment result.
- CVP report.
- Manual smoke-test result.

## Release exit criteria

A release is ready when:

1. npm run test passes.
2. npm run lint passes.
3. npm run build passes.
4. Phase 15 automated validation has no unresolved release blocker.
5. Firebase Firestore rules are deployed from the version-controlled source.
6. Vercel Preview is manually smoke-tested.
7. Production is deployed from the approved main commit.
8. Production authentication and persistence are verified.
9. PWA/responsive smoke tests pass.
10. No P0/P1 defects remain open.
