# PALMI-D3V Validation Framework

## 1. Purpose

The framework provides a common validation language and evidence contract for PALMI-D3V projects. It is a project-aware validation system, not a single test library.

## 2. Validation levels

| Level | Name | Purpose |
|---|---|---|
| V0 | Repository Contract | Verify expected files, directories, configuration and project profile. |
| V1 | Domain Validation | Verify pure business logic and deterministic behavior. |
| V2 | Static Quality | Verify linting, type checks, formatting and dependency/configuration rules where applicable. |
| V3 | Build / Runtime Artifact | Verify production artifact, PWA/package/bundle and startup requirements. |
| V4 | Integration Validation | Verify persistence, APIs, authentication, permissions and external adapters. |
| V5 | CVP — Critical Value Path | Verify the smallest set of flows proving core product value. |
| V6 | E2E — End-to-End | Verify complete user workflows through the real application boundary. |
| V7 | IPV — Interactive Product Verification | A responsible maintainer operates the product, observes visible behavior and verifies the user experience. |
| V8 | Production Acceptance | Verify deployed release, deployment configuration, smoke behavior, PWA/responsive behavior and rollback readiness. |

A project may not need every level in every run, but its profile must declare which levels are required for a release.

## 3. CVP is not the whole validation system

**CVP** asks which critical user journeys must always work. **E2E** checks complete workflows across the application boundary. **IPV** verifies that a real user can operate the product and observe the expected result.

A DOM assertion does not replace checking navigation, visual hierarchy, responsive behavior, keyboard focus, loading states, error states and the interaction model in the running application.

## 4. Interactive Product Verification

A focused IPV run is an Interactive Smoke Test (IST). Typical steps:

1. Start the application or open the target deployment.
2. Authenticate with a dedicated QA account when required.
3. Identify the primary user flow and perform the real interactions.
4. Observe visible UI state after each important action.
5. Verify success, error, loading, empty, disabled and permission states where relevant.
6. Refresh or navigate when persistence is part of the requirement.
7. Record evidence and defects.
8. Stop when the declared scenario is proven.

Scenarios belong in the project's validation profile or QA matrix; manual validation should remain focused and bounded.

## 5. Validation profile

Every adopted project should expose a machine-readable profile containing project identity, app path, stack, install/test/lint/build commands, required paths, configuration checks, required validation levels, critical journeys, production target and release evidence. Secrets and personal data never belong in the profile.

DayFlow's profile is app/cvp/DAYFLOW_PROFILE.json.

## 6. Validation modes

- **Fast/local:** V0, V1, V2, V3.
- **Pre-merge:** V0–V3, affected V4/V5 checks and CI.
- **Release:** all required automated levels, CVP, authenticated E2E, IPV, deployment evidence, security/configuration evidence and rollback evidence.

## 7. Evidence model

Every result should identify project, commit SHA, environment, validator/profile version, timestamp, checks executed, PASS/FAIL/WARN/SKIP, release decision and known exceptions. A green result without its commit and environment is incomplete evidence.

## 8. Failure policy

- **FAIL:** release blocker unless explicitly waived and documented.
- **WARN:** technical concern requiring review.
- **SKIP:** required validation was not executed; it is not equivalent to PASS.
- **PASS:** check completed successfully.

A project is not fully validated while required checks remain skipped.

## 9. Responsible maintainer contract

The person implementing the change is accountable for:

1. Reading the project validation profile before changing architecture.
2. Identifying affected validation levels.
3. Preserving validation behavior unless the task explicitly changes it.
4. Adding or updating tests for new critical behavior.
5. Running the smallest relevant validation first and all required checks before release.
6. Reporting exact commands, target environment, failures and skipped stages.
7. Keeping secrets out of source, logs and reports.
8. Leaving reproducible instructions and known limitations.

Never report PASS from source inspection alone.

## 10. DayFlow validation status

Report status for the exact commit and environment. Recent static CI has passed for the consolidation branch; CVP and authenticated E2E were skipped because required QA credentials were unavailable. Therefore complete release acceptance is still pending.

## 11. Adoption rule

Each project owns its validation profile, test scenarios, adapters and release evidence. Do not copy DayFlow-specific paths or Firebase assumptions into unrelated projects.