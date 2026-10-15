# PALMI-D3V Single-owner Validation Workflow

This project is delivered by one responsible maintainer. No multi-agent team or agent assignments are part of the workflow.

## Required reading

1. validation/README.md
2. validation/PALMI-D3V_VALIDATION_FRAMEWORK.md
3. validation/PALMI-D3V_SOLO_WORKFLOW.md
4. The project's validation profile.
5. The project's README and QA/release documentation.

## Required behavior

- Treat the validation profile as the executable contract.
- Inspect the current branch/commit and relevant code before editing.
- Define scope, affected data paths, security implications and rollback needs.
- Make small, traceable changes and add tests for deterministic behavior.
- Never claim a validation stage passed without executing it or having explicit CI evidence.
- Report PASS, FAIL, WARN and SKIP separately.
- Keep credentials, tokens, production exports and personal data out of code/logs.

## Execution order

Repository contract → domain/unit tests → static quality → build/PWA → integration and Rules tests → CVP → authenticated E2E → manual IPV/IST → production acceptance.

## Legacy repository rule

Do not retire To-Do or Timetable until active dependencies, deployment settings, Firestore paths, scheduled functions, migrated functionality, history and rollback requirements have been verified.