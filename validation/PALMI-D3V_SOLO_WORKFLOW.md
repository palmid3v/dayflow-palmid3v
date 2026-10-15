# PALMI-D3V Solo Validation Workflow

Use one accountable maintainer for implementation, verification and release sign-off.

## Understand and baseline

- Read README, context, validation profile and relevant architecture/security documentation.
- Confirm branch, commit and clean working-tree state.
- Run the fastest available baseline validation before changing code.

## Implement and validate

- Make the smallest change that satisfies the requirement and preserves documented contracts.
- Add or update deterministic tests for domain and migration logic.
- Validate in order: profile/static checks, unit tests, lint, build, affected Firebase Emulator Rules tests, CVP, authenticated E2E, manual IPV/IST and release acceptance.
- Stop to address failures; explicitly document every skipped check and why it was skipped.

## Report and release

Record the change summary, rationale, files modified, commit SHA, commands executed, PASS/FAIL/WARN/SKIP per stage, target environment, limitations and next gate.

Recommend release only after all required tests pass, UI behavior has been manually verified, security/configuration aligns with the release, deployment evidence exists and rollback is ready.

## Legacy repository retirement

Before retiring a source repository, verify migrated functionality, Firestore paths/data, deployments, scheduled functions, environment variables (names only), external references and required history. Keep backups and a rollback path until reconciliation has been recorded. Never delete a repository merely because the new frontend appears to work.