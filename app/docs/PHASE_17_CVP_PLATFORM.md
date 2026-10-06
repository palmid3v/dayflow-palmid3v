# DayFlow — Phase 17: CVP Platform Foundation

## Objective

Phase 17 turns DayFlow validation knowledge into a reusable, project-aware CVP foundation.

## What is built

### Project profile

app/cvp/DAYFLOW_PROFILE.json describes product identity, stack, commands, repository paths, source checks, validation levels, critical journeys, interactive smoke scenarios, and release gates.

The profile is descriptive. It contains no credentials, Firebase secrets, or user data.

### Profile validator

app/scripts/Validate-CVPProfile.ps1 validates the profile and repository contract.

Default:

    .\app\scripts\Validate-CVPProfile.ps1

With command execution:

    .\app\scripts\Validate-CVPProfile.ps1 -RunCommands

### DayFlow validation runner

app/scripts/validate.mjs orchestrates Unit → Lint → Build → CVP → Full Production E2E.

## Relationship to the PALMI-D3V framework

The reusable framework is now documented outside the DayFlow-specific implementation:

- validation/PALMI-D3V_VALIDATION_FRAMEWORK.md
- validation/PALMI-D3V_AGENT_WORKFLOW.md
- validation/PROJECT_VALIDATION_PROFILE.template.json

DayFlow remains the reference implementation. Other projects must provide their own profile, journeys, integrations, and release gates.

## Terminology

- CVP — Critical Value Path: minimum critical journeys proving core value.
- E2E — End-to-End: complete application workflows.
- IPV — Interactive Product Verification: human/agent-driven UI verification with visible-result checks.
- IST — Interactive Smoke Test: focused IPV run for high-risk UI flows.
- Production Acceptance — deployed-release verification and evidence.

## Exit criteria

- [x] Machine-readable DayFlow profile.
- [x] Profile validator.
- [x] Unit/lint/build validation.
- [x] CVP.
- [x] Production E2E.
- [x] Reusable PALMI-D3V validation contract.
- [x] Agent workflow.
- [ ] Production acceptance evidence completed for each release.
