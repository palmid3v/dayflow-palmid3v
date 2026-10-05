# DayFlow — Phase 17: CVP Platform Foundation

## Objective

Phase 17 turns the DayFlow validation knowledge into a reusable, project-aware CVP foundation.

The existing DayFlow validator remains the authoritative release runner for DayFlow. Phase 17 adds a machine-readable project profile so validation requirements are no longer represented only as hard-coded PowerShell assumptions.

## What is built

### 1. Project profile

app/cvp/DAYFLOW_PROFILE.json describes:

- product identity and application path;
- technology stack;
- install/test/lint/build commands;
- required repository files and directories;
- source-level configuration checks;
- production release gates.

The profile is intentionally descriptive. It does not contain credentials, Firebase secrets, or user data.

### 2. Profile validator

app/scripts/Validate-CVPProfile.ps1 validates the profile itself and verifies that the repository still satisfies its declared structure and source checks.

Default mode is structural and fast:

    .\app\scripts\Validate-CVPProfile.ps1

Command execution can be requested explicitly:

    .\app\scripts\Validate-CVPProfile.ps1 -RunCommands

The command mode runs the profile's declared install, test, lint, and build commands from app.

### 3. Existing DayFlow release validation remains intact

Phase 17 does not replace:

- Validate-DayFlow.ps1;
- Validate-ProductionReadiness.ps1;
- Firebase deployment evidence;
- production E2E;
- manual smoke testing.

Those remain release gates.

## Design rules

1. The profile is configuration, not a second source of truth for application behavior.
2. No credentials or secrets are stored in the profile.
3. The existing DayFlow validator remains responsible for DayFlow-specific E2E and release behavior.
4. New projects can adopt the same profile shape without copying DayFlow's feature implementation.
5. A profile must describe real repository paths and commands.
6. Production readiness still requires deployment evidence; local profile validation is not deployment proof.

## Validation

Phase 17 validation target:

- profile parses successfully;
- all declared required paths exist;
- all declared source checks pass;
- optional command execution passes;
- existing DayFlow test/lint/build validation remains green.

## Exit criteria

- [ ] Profile committed to main.
- [ ] Profile validator passes.
- [ ] npm test passes.
- [ ] npm run lint passes.
- [ ] npm run build passes.
- [ ] Existing CVP/release validator remains unchanged and functional.
- [ ] No secrets are introduced.
- [ ] PR review confirms the profile reflects the current DayFlow architecture.

## Why this phase exists

The CVP documentation already identifies project-aware validation as the long-term direction. Phase 17 implements that foundation without changing DayFlow runtime behavior.
