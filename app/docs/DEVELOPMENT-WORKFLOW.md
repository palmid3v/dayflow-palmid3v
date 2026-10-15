# DayFlow — Single-owner Development Workflow

This project is maintained through one coordinated implementation flow. No multi-agent team is part of the delivery model.

## Change sequence

1. Read the current README, context, audit and relevant feature contract.
2. Confirm the target branch/commit and inspect existing implementations before editing.
3. Define scope, affected data collections, access requirements and rollback considerations.
4. Make a focused change while preserving existing contracts and dependency versions.
5. Add deterministic unit/domain tests for changed behavior.
6. Run available validation in order: static profile checks, unit tests, lint, build, Firestore Rules tests, CVP and authenticated E2E.
7. Manually verify UI changes across narrow and wide viewports, keyboard interaction, empty/loading/error states and reduced motion.
8. Record changed files, commands, pass/fail/skip status, known risks and the next release gate.

## Data and security rules

- Firestore is the cloud source of truth; LocalStorage is a recovery/cache layer.
- Never run destructive migration against production as an experiment.
- Migration jobs must be idempotent, backed up, measurable and reversible where feasible.
- Firestore Rules remain the authorization boundary; hiding a feature in the UI is not security.
- Never commit secrets, admin credentials, production exports or private test data.
- Keep dependencies stable during migration. Toolchain upgrades should be separate, tested changes.
- Do not claim a production release is verified without deployment and smoke-test evidence.

## Release gates

npm run validate:static → Firebase Emulator Rules tests → CVP → full authenticated E2E → manual IPV/IST → preview/production smoke checks → rollback readiness.

A successful static CI run does not prove that authenticated E2E or production acceptance has passed.

## Legacy repository retirement

Retire To-Do or Timetable only after functionality, data, permissions, deployments, functions, environment configuration, history, external references and rollback requirements have been verified. Until then, preserve both repositories as read-only migration sources.