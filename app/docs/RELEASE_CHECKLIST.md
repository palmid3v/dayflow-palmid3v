# DayFlow Release Checklist

## Phase 13 — QA / Hardening

- Automated pure-domain regression suite is part of CI.
- Lint and production build remain mandatory CI gates.
- Firestore rules are version-controlled in firestore.rules.
- Production frontend configuration uses Vercel environment variables.
- Firebase credentials are never committed to the repository.
- Legacy To-Do and Timetable repositories remain migration/rollback sources only.

## Phase 14 — Production Release

### Before release

- [ ] Merge the approved Phase 13–14 pull request into main.
- [ ] Confirm GitHub CI is green.
- [ ] Confirm Vercel Preview is healthy.
- [ ] Confirm Firebase Firestore rules are deployed from the repository.
- [ ] Confirm Firebase Authentication sign-in and verification work.
- [ ] Complete the manual QA matrix.

### Production

- [ ] Redeploy Production after the approved main commit.
- [ ] Verify authentication.
- [ ] Verify task persistence.
- [ ] Verify schedule persistence.
- [ ] Verify calendar import.
- [ ] Verify reminders.
- [ ] Verify Memory and Dashboard.
- [ ] Verify Admin Access Manager.
- [ ] Verify mobile/PWA behavior.

## Phase 15 — Continuous Validation

- [ ] Run CVP Automatic mode.
- [ ] Confirm source, dependency, test, lint, build, Firebase, and PWA checks pass.
- [ ] Resolve automated FAIL/WARN/SKIP results before declaring the automated gate green.
- [ ] Run production E2E with a dedicated QA account when credentials/auth state are available.
- [ ] Keep secrets out of the repository and validation reports.

## Phase 16 — Production Readiness

### Source / build

- [ ] Current release commit is identified.
- [ ] npm ci passes.
- [ ] npm run test passes.
- [ ] npm run lint passes.
- [ ] npm run build passes.
- [ ] Phase 15 CVP report is green or explicitly accepted with documented exceptions.

### Firebase

- [ ] firebase.json references the canonical root firestore.rules.
- [ ] Firebase CLI is authenticated for the release operator.
- [ ] Firestore rules are deployed from the approved main commit.
- [ ] Firebase Authentication sign-in and verification are confirmed.
- [ ] User data isolation is confirmed.
- [ ] Admin and feature-level permissions are confirmed.

### Vercel

- [ ] Project Root Directory is app.
- [ ] Production deployment uses the approved main commit.
- [ ] Required VITE_FIREBASE_* production variables are configured.
- [ ] Production URL is reachable.
- [ ] Production deployment is not blocked by a build or deployment rate limit.

### Manual smoke test

- [ ] Authentication flow.
- [ ] Today.
- [ ] Tasks CRUD.
- [ ] Schedule CRUD.
- [ ] Calendar .ics import and clear.
- [ ] Reminders.
- [ ] Memory.
- [ ] Dashboard.
- [ ] Admin Access Manager.
- [ ] Settings.
- [ ] Refresh/persistence.
- [ ] Mobile responsive behavior.
- [ ] PWA installation/runtime.

### Rollback readiness

- [ ] Last known-good Vercel deployment is identified.
- [ ] Approved release commit SHA is recorded.
- [ ] Firebase rules are aligned with the release.
- [ ] Vercel rollback/redeploy path is known.
- [ ] Any production defect has a GitHub issue or documented release record.

## Release evidence

Keep these artifacts together:

1. CVP automated validation report.
2. GitHub CI result.
3. Vercel production deployment result.
4. Firebase rules deployment confirmation.
5. Manual smoke-test result.
6. Approved release commit SHA.

## Rollback

If a production regression is discovered:

1. Stop feature work on the release branch.
2. Revert the release merge commit or redeploy the last known-good Vercel deployment.
3. Keep Firestore rules aligned with the application version.
4. Record the defect in GitHub before preparing the next patch.

## Release status

Phase 16 implementation provides the release gates and validation tooling. Production approval remains an evidence-based deployment/QA decision, not an assumption made by the repository.
