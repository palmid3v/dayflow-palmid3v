# PALMI-D3V Validation Workflow

Use validation/PALMI-D3V_VALIDATION_FRAMEWORK.md as the canonical validation contract and validation/PALMI-D3V_AGENT_WORKFLOW.md as the implementation workflow.

Before changing code, read the project validation profile and identify affected validation levels.

Before release, execute the required automated validation, CVP, E2E, Interactive Product Verification (IPV), production acceptance, and rollback evidence gates declared by the project profile.

Never claim PASS without execution or explicit CI evidence. Keep secrets out of source, profiles, logs, and reports.

Never retire a legacy repository without proving that the active project no longer depends on its code, documentation, CI, deployment, environment variables, or external integrations.