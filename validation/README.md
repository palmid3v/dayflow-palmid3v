# PALMI-D3V Validation Framework

The **PALMI-D3V Validation Framework** is the reusable validation contract for PALMI-D3V projects.

It defines what "working", "validated", and "release-ready" mean without forcing every project to use the same application stack.

## Canonical documents

- `PALMI-D3V_VALIDATION_FRAMEWORK.md` — validation levels, gates, evidence, and terminology.
- `PALMI-D3V_AGENT_WORKFLOW.md` — workflow an implementation agent follows when modifying a project.
- `PROJECT_VALIDATION_PROFILE.template.json` — machine-readable project contract template.

## Core principle

> Do not declare a project done because code was written. Declare it done when the project can demonstrate that the intended behavior works.

## Project adoption

Each project should provide:

1. A machine-readable validation profile.
2. Automated unit/domain checks where appropriate.
3. Static quality checks.
4. A production/build check.
5. Critical Value Path (CVP) tests.
6. End-to-end tests for important workflows.
7. Interactive Product Verification (IPV) for UI behavior that assertions alone cannot prove.
8. Release evidence for deployment, security/configuration, and rollback.

DayFlow is the reference implementation of this contract.
