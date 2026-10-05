# CVP — Continuous Validation Process

CVP is the PALMI-D3V validation methodology for proving that a product is ready before production.

## Core rule

> A feature is not done until the product can automatically prove that it works.

## DayFlow v0.1

The first CVP implementation is project-specific and learns from:

- README.md
- docs/
- app/package.json
- application source
- tests
- E2E scenarios
- Firebase configuration and rules
- PWA configuration
- production deployment

### Validation modes

#### Automatic

The DayFlow runner discovers the DayFlow structure, validates source/configuration, runs tests, lint, build, PWA checks, Firebase source checks, and production E2E when authentication state is available.

#### Manual

Manual validation remains the human release layer described in docs/QA_MATRIX.md. It is used for checks that require real-world judgment, visual inspection, deployment confirmation, or credentials that should not be automated by default.

## Phase 17 — project-aware profile

DayFlow now has a machine-readable validation profile at app/cvp/DAYFLOW_PROFILE.json.

The profile declares:

- product identity;
- stack;
- install/test/lint/build commands;
- required files and directories;
- source configuration checks;
- release gates.

Validate the profile with:

    .\app\scripts\Validate-CVPProfile.ps1

Run the declared local commands as well with:

    .\app\scripts\Validate-CVPProfile.ps1 -RunCommands

The profile is not a replacement for the DayFlow release runner. It is a reusable description layer that makes the validation contract explicit and portable.

## Exit criteria

CVP is green only when:

- automated failures = 0;
- warnings/skips are either resolved or explicitly accepted;
- source configuration matches deployment configuration;
- production E2E passes;
- Firebase rules are deployed from the canonical version-controlled source;
- manual release checks are complete.

The Phase 17 profile validator adds a structural contract check, but it cannot prove deployment, credentials, or manual smoke-test results.

## Future CVP direction

The long-term CVP should become project-aware instead of DayFlow-specific. Phase 17 establishes that direction with a machine-readable project profile. Future PALMI-D3V projects can adopt the same profile contract without copying DayFlow's feature-specific validation logic.
