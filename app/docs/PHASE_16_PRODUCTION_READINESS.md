# DayFlow — Phase 16 Production Readiness

## Objective

Phase 16 moves DayFlow from feature-complete development into a controlled production-release state.

The phase does not introduce a new productivity module. It hardens the release process around the existing product:

- Vercel production deployment
- Firebase Authentication
- Cloud Firestore rules and persistence
- PWA installation/runtime behavior
- production smoke testing
- rollback readiness
- release evidence and traceability

## Release gates

A Phase 16 release candidate is considered ready only when all applicable gates are green.

### 1. Source and build

- [ ] Current release commit is on main.
- [ ] npm ci completes successfully.
- [ ] npm run test passes.
- [ ] npm run lint passes.
- [ ] npm run build passes.
- [ ] CVP reports zero FAIL/WARN/SKIP for the automated release run, or any exception is explicitly accepted.

### 2. Firebase

- [ ] firebase.json points to the canonical root firestore.rules.
- [ ] Firestore rules in the deployed project match the approved main commit.
- [ ] Firebase Authentication sign-in works.
- [ ] Verified users receive the expected DayFlow access decision.
- [ ] User data remains isolated by users/{uid}.
- [ ] Admin access is restricted to platform admins.
- [ ] Feature permissions are enforced by Firestore rules, not only by UI state.

> Firebase CLI authentication and rule deployment are operational checks. Source validation alone is not evidence that production rules are deployed.

### 3. Vercel

- [ ] Vercel Project Root Directory is app.
- [ ] Production deployment uses the approved main commit.
- [ ] Required VITE_FIREBASE_* variables are configured in the Vercel Production environment.
- [ ] Production URL responds successfully.
- [ ] No production deployment rate-limit or build error remains.
- [ ] Preview and Production use the same approved application configuration.

### 4. Application smoke test

Run the manual smoke test with a dedicated QA account.

Authentication:
- [ ] Sign in.
- [ ] Sign out.
- [ ] Verified/unverified behavior is correct.
- [ ] Access denied is shown when DayFlow access is absent.

Core flow:
- [ ] Today loads.
- [ ] Task create/edit/complete/delete works.
- [ ] Schedule create/edit/duplicate/delete works.
- [ ] .ics import works.
- [ ] Imported calendar clear works.
- [ ] Reminder create/complete/delete works.
- [ ] Memory save/load works.
- [ ] Dashboard metrics reflect current data.
- [ ] Settings opens and closes correctly.
- [ ] Admin Access Manager is available only to admins.

Persistence:
- [ ] Refresh does not lose saved data.
- [ ] A second session sees the same cloud-backed data.
- [ ] Local-first fallback remains usable when cloud sync is unavailable.

### 5. PWA and responsive behavior

- [ ] Production manifest is valid.
- [ ] PWA icons resolve.
- [ ] Service worker is registered in a supported production browser.
- [ ] App can be installed.
- [ ] Installed app opens the DayFlow shell.
- [ ] Mobile navigation is usable.
- [ ] No horizontal overflow on narrow screens.
- [ ] Reduced-motion preference is respected.

### 6. Rollback

Before approving production:

- [ ] Identify the last known-good production deployment.
- [ ] Record the approved main commit SHA.
- [ ] Confirm Firestore rules are version-controlled and deployable from that same release.
- [ ] Know the Vercel rollback/redeploy path.
- [ ] Do not mix application code from one release with Firestore rules from another release.

## Evidence

Keep the following evidence with the release:

1. Automated CVP report.
2. GitHub CI result.
3. Vercel production deployment result.
4. Firebase rules deployment confirmation.
5. Manual smoke-test result.
6. Release commit SHA.

## Exit criteria

Phase 16 is complete when:

- all source/build gates pass;
- production deployment is healthy;
- Firebase Authentication and Firestore behavior are verified;
- the manual smoke test passes;
- PWA/responsive behavior passes;
- rollback information is recorded;
- no P0/P1 release blocker remains.

A production-ready decision must be based on evidence, not on local build success alone.
