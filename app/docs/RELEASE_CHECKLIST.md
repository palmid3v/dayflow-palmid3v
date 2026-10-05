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

### Rollback

If a production regression is discovered:

1. Stop feature work on the release branch.
2. Revert the release merge commit or redeploy the last known-good Vercel deployment.
3. Keep Firestore rules aligned with the application version.
4. Record the defect in GitHub before preparing the next patch.

## Release status

Phase 13–14 implementation is complete when the CI gates and release checklist are merged into main. Production approval remains a deployment/QA decision, not an assumption made by the repository.
