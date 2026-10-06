# DayFlow Release Checklist

## Validation contract

DayFlow follows the PALMI-D3V Validation Framework:

- V0 Repository Contract
- V1 Domain Validation
- V2 Static Quality
- V3 Build / Artifact
- V4 Integration
- V5 CVP
- V6 E2E
- V7 Interactive Product Verification
- V8 Production Acceptance

## Automated validation

- [ ] Run npm run validate:static.
- [ ] Confirm Unit, Lint, Build, and PWA gates pass.
- [ ] Run npm run validate with the dedicated QA account.
- [ ] Confirm CVP passes.
- [ ] Confirm production E2E passes.
- [ ] Resolve FAIL results before declaring the automated gate green.
- [ ] Review WARN/SKIP results and document accepted exceptions.
- [ ] Keep secrets out of repository and reports.

## Production readiness

### Firebase

- [ ] firebase.json references canonical root firestore.rules.
- [ ] Firebase CLI is authenticated.
- [ ] Firestore rules are deployed from the approved main commit.
- [ ] Authentication and verification are confirmed.
- [ ] User data isolation is confirmed.
- [ ] Admin and feature-level permissions are confirmed.

### Vercel

- [ ] Project Root Directory is app.
- [ ] Production deployment uses the approved main commit.
- [ ] Required production environment variables are configured.
- [ ] Production URL is reachable.
- [ ] Production deployment is healthy.

## Interactive Product Verification

IPV is a first-class release gate for behavior automated tests cannot fully prove.

### Interactive Smoke Test

- [ ] Open approved Preview.
- [ ] Open approved Production.
- [ ] Authenticate with dedicated QA account.
- [ ] Execute primary DayFlow flow.
- [ ] Press the primary Play/start action when applicable.
- [ ] Verify visible state transitions.
- [ ] Verify representative CRUD interactions.
- [ ] Verify relevant loading/empty/error/disabled states.
- [ ] Verify refresh/persistence where relevant.
- [ ] Verify desktop and mobile behavior.
- [ ] Verify PWA runtime behavior.

## Rollback readiness

- [ ] Last known-good Vercel deployment identified.
- [ ] Approved release commit SHA recorded.
- [ ] Firebase rules aligned with release.
- [ ] Vercel rollback/redeploy path known.
- [ ] Production defects tracked.

## Release evidence

Keep:

1. Automated validation result.
2. GitHub CI result.
3. Vercel production deployment result.
4. Firebase rules deployment confirmation.
5. CVP result.
6. Full E2E result.
7. IPV/IST result.
8. Approved release commit SHA.
9. Rollback evidence.

## Legacy repository retirement

To retire To-Do or Timetable:

- [ ] Confirm no runtime dependency remains.
- [ ] Search source, docs, CI, Vercel, Firebase, environment variables, and deployment hooks for references.
- [ ] Confirm migrated functionality is covered by DayFlow validation.
- [ ] Preserve required history/export/archive.
- [ ] Disable obsolete external integrations.
- [ ] Archive or delete only after explicit approval.

## Rollback

If a production regression is discovered:

1. Stop feature work on the release branch.
2. Revert the release merge or redeploy the last known-good Vercel deployment.
3. Keep Firestore rules aligned with the application version.
4. Record the defect before preparing the next patch.
