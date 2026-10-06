# CVP — Continuous Validation Process

CVP is the PALMI-D3V methodology for proving that a product's critical value works before production.

The broader contract is documented in:

- validation/PALMI-D3V_VALIDATION_FRAMEWORK.md
- validation/PALMI-D3V_AGENT_WORKFLOW.md

## Core rule

> A feature is not done until the product can demonstrate that the intended behavior works.

## DayFlow implementation

DayFlow uses app/cvp/DAYFLOW_PROFILE.json and app/scripts/validate.mjs.

The profile describes product identity, stack, commands, repository contract, source checks, validation levels, critical journeys, interactive smoke scenarios, and release gates.

## Validation layers

### Automatic

The DayFlow runner executes:

1. Unit/domain tests.
2. Lint.
3. Production build and PWA generation.
4. Critical Value Path.
5. Full production E2E.

### Interactive

Interactive Product Verification (IPV) is the human/agent layer for UI behavior automated assertions cannot fully prove.

A focused run is an Interactive Smoke Test (IST).

Use IPV for primary interaction, Play/start actions, visible state transitions, loading/empty/error/disabled states, responsive behavior, PWA interaction, and refresh/persistence behavior.

### Production acceptance

Production acceptance additionally requires deployment evidence, Firebase/Vercel verification, manual smoke evidence, and rollback readiness.

## Commands

From app:

    npm run validate:static
    npm run test:cvp
    npm run test:e2e
    npm run validate

Profile validation:

    .\scripts\Validate-CVPProfile.ps1
    .\scripts\Validate-CVPProfile.ps1 -RunCommands

## Exit criteria

CVP is green when declared critical journeys pass.

Overall project validation is green only when all required validation levels pass and required IPV/production gates are complete.

## Future direction

DayFlow is the reference implementation. Other PALMI-D3V projects should adopt the shared profile contract and agent workflow while keeping their own application-specific journeys and integrations.
