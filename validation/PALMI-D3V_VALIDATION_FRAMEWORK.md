# PALMI-D3V Validation Framework

## 1. Purpose

The framework provides a common validation language and workflow for all PALMI-D3V projects.

It is **not** a single test library. It is a project-aware validation system composed of a shared contract plus project-specific adapters.

## 2. Validation levels

| Level | Name | Purpose |
|---|---|---|
| V0 | Repository Contract | Verify expected files, directories, configuration, and project profile. |
| V1 | Domain Validation | Verify pure business logic and deterministic behavior. |
| V2 | Static Quality | Verify linting, type checks, formatting, dependency/configuration rules where applicable. |
| V3 | Build / Runtime Artifact | Verify the production artifact, PWA/package/bundle, and startup requirements. |
| V4 | Integration Validation | Verify persistence, APIs, authentication, permissions, and external adapters. |
| V5 | CVP — Critical Value Path | Verify the smallest set of flows that proves the product's core value works. |
| V6 | E2E — End-to-End | Verify complete user workflows through the real application boundary. |
| V7 | IPV — Interactive Product Verification | Human/agent-driven UI verification: open the product, interact with controls, observe visible behavior, and confirm the experience. |
| V8 | Production Acceptance | Verify the deployed release, deployment configuration, smoke behavior, PWA/responsive behavior, and rollback readiness. |

A project may not need every level in every run, but its profile must declare which levels are required for its release class.

## 3. CVP is not the whole validation system

**CVP** answers:

> What are the minimum critical user journeys that must always work?

**E2E** answers:

> Does the complete workflow work across the application boundary?

**IPV** answers:

> Can a real user or implementation agent operate the product and observe the expected result?

This distinction is important. A test that asserts a DOM state is not a replacement for opening the application, using the UI, checking navigation, visual hierarchy, responsive behavior, focus, loading states, and the actual interaction model.

## 4. Interactive Product Verification (IPV)

The process previously described informally as "give the green Play button and test the app" is formally called:

**Interactive Product Verification (IPV)**

A focused run is an:

**Interactive Smoke Test (IST)**

Typical IPV flow:

1. Start the application or open the target deployment.
2. Authenticate with a dedicated QA account when required.
3. Identify the primary user flow.
4. Perform the actions as a user would.
5. Observe visible UI state after each important action.
6. Verify success, error, loading, empty, disabled, and permission states where relevant.
7. Refresh or navigate when persistence is part of the requirement.
8. Record evidence and any defect.
9. Stop when the declared scenario is proven.

IPV should not become an unbounded manual checklist. Scenarios belong in the project's validation profile or QA matrix.

## 5. Validation profile

Every adopted project should expose a machine-readable profile containing at minimum:

- project identity;
- application path;
- stack;
- install/test/lint/build commands;
- required repository paths;
- source/configuration checks;
- required validation levels;
- critical journeys;
- production target;
- required release evidence.

Secrets, passwords, tokens, and personal data must never be stored in the profile.

DayFlow's current profile is:

`app/cvp/DAYFLOW_PROFILE.json`

## 6. Validation modes

### Fast / local

Use for development feedback:

- V0
- V1
- V2
- V3

### Pre-merge

Use before merging meaningful changes:

- V0
- V1
- V2
- V3
- affected V4/V5 tests
- CI

### Release

Use for a release candidate:

- all required automated levels;
- CVP;
- production E2E where configured;
- IPV;
- deployment evidence;
- Firebase/API/security evidence where applicable;
- rollback evidence.

## 7. Evidence model

A validation result should identify:

- project;
- commit SHA;
- environment;
- validator/profile version;
- timestamp;
- checks executed;
- PASS / FAIL / WARN / SKIP;
- release decision;
- known exceptions.

A green result without identifying the commit and environment is incomplete release evidence.

## 8. Failure policy

- **FAIL** = release blocker unless explicitly waived and documented.
- **WARN** = technical concern requiring review.
- **SKIP** = required validation was not executed; it is not equivalent to PASS.
- **PASS** = check completed successfully.

A project is not "fully validated" while required checks remain skipped.

## 9. Agent contract

An implementation agent must:

1. Read the project's validation profile before changing architecture.
2. Identify the affected validation levels.
3. Preserve existing validation behavior unless the task explicitly changes it.
4. Add or update tests for new critical behavior.
5. Run the smallest relevant validation first.
6. Run the full required validation before release.
7. Never claim PASS from source inspection alone.
8. Report failures with the exact stage and reproducible command.
9. Keep secrets out of source, logs, and reports.
10. Leave the repository in a state another agent can validate without tribal knowledge.

## 10. DayFlow reference result

DayFlow currently demonstrates:

- 11/11 unit tests;
- lint with 0 errors;
- production build PASS;
- PWA generation PASS;
- CVP PASS;
- full production E2E PASS.

The remaining production acceptance evidence is tracked separately in DayFlow's release checklist.

## 11. Adoption rule

The framework belongs to PALMI-D3V. Individual projects own their profiles, test scenarios, adapters, and release evidence.

Do not copy DayFlow-specific paths or Firebase assumptions into unrelated projects.
