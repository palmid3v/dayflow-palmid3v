# PALMI-D3V Validation Framework

The PALMI-D3V Validation Framework defines evidence required to call a project working, validated or release-ready without requiring a specific application stack.

## Canonical documents

- PALMI-D3V_VALIDATION_FRAMEWORK.md — validation levels, gates, evidence and terminology.
- PALMI-D3V_SOLO_WORKFLOW.md — single-owner implementation, verification and release workflow.
- PROJECT_VALIDATION_PROFILE.template.json — machine-readable project contract template.

## Core principle

> Do not declare a project done because code was written. Declare it done when the intended behavior is demonstrated by repeatable checks and recorded evidence.

## Project adoption

1. A machine-readable validation profile.
2. Automated unit/domain checks where appropriate.
3. Static quality checks.
4. Production-build validation.
5. Critical Value Path (CVP) tests.
6. End-to-end tests for important workflows.
7. Interactive Product Verification (IPV) for UI behavior that assertions alone cannot prove.
8. Release evidence for deployment, security/configuration and rollback.

DayFlow is the reference implementation of this contract. A single maintainer coordinates implementation and signs off releases; no multi-agent workflow is required.