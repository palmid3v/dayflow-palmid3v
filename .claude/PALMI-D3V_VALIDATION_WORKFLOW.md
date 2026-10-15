# PALMI-D3V Single-owner Validation Workflow

Use validation/PALMI-D3V_VALIDATION_FRAMEWORK.md as the canonical validation contract and validation/PALMI-D3V_SOLO_WORKFLOW.md as the implementation workflow.

One responsible maintainer owns implementation, tests and release sign-off. Do not establish a multi-agent team.

Before implementation, inspect the project profile, current branch and affected code. Add tests for deterministic changes. Before release, run static validation, build, Firestore Rules Emulator tests, CVP, authenticated E2E, manual IPV/IST and deployment/rollback checks.

Never claim PASS without execution or explicit CI evidence. A SKIP is not a PASS. Keep secrets and production user data out of source, logs and reports.

Never retire a legacy repository until its code, docs, CI, deployment, environment, data paths, scheduled functions and external integrations are proven unnecessary.