# CVP — Continuous Validation Process

CVP is the PALMI-D3V validation methodology for proving that a product is ready before production.

## Core rule

> A feature is not done until the product can automatically prove that it works.

## DayFlow v0.1

The first CVP implementation is intentionally project-specific. It learns from:

- `README.md`
- `docs/`
- `app/package.json`
- application source
- tests
- E2E scenarios
- Firebase configuration and rules
- PWA configuration
- production deployment

### Validation modes

#### Automatic

The runner discovers the DayFlow structure, validates source/configuration, runs tests, lint, build, PWA checks, Firebase source checks, and production E2E when authentication state is available.

#### Manual

Manual validation remains the human release layer described in `docs/QA_MATRIX.md`. It is used for checks that require real-world judgment, visual inspection, deployment confirmation, or credentials that should not be automated by default.

## Exit criteria

CVP is green only when:

- automated failures = 0
- warnings/skips are either resolved or explicitly accepted
- source configuration matches deployment configuration
- production E2E passes
- Firebase rules are deployed from the canonical version-controlled source
- manual release checks are complete

## Future CVP direction

The long-term CVP should become project-aware instead of DayFlow-specific. A project profile/context document should describe the product, features, architecture, risks, test data conventions, and release rules. CVP can then derive validation scenarios from that context instead of relying on hard-coded feature assumptions.
