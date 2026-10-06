# PALMI-D3V Agent Validation Workflow

This document is the operational workflow for an implementation agent working on a PALMI-D3V project.

## Phase A — Understand

1. Read the repository README.
2. Read the project validation profile.
3. Read the relevant architecture and QA documents.
4. Identify the requested feature and affected validation levels.
5. Do not assume another repository is still authoritative without evidence.

## Phase B — Baseline

Before changing code:

1. Confirm the current branch and commit.
2. Confirm the working tree state.
3. Run the project's fast validation command if available.
4. Record the baseline result.

## Phase C — Implement

1. Make the smallest change that satisfies the requirement.
2. Preserve existing contracts.
3. Do not replace working technologies without a documented reason.
4. Add/update unit or integration tests for deterministic behavior.
5. Add/update CVP coverage when the change affects a critical journey.
6. Add/update E2E coverage when the change crosses application boundaries.
7. Add/update IPV scenarios when the change affects user interaction, layout, navigation, visual states, or device behavior.

## Phase D — Validate

Run in this order:

1. Repository/profile validation.
2. Domain/unit tests.
3. Static quality checks.
4. Build/artifact validation.
5. Affected integration checks.
6. CVP.
7. Full E2E.
8. Interactive Product Verification.
9. Production acceptance gates when preparing a release.

Stop and fix failures before moving to the next release gate.

## Phase E — Report

The agent must report:

- what changed;
- why it changed;
- validation commands executed;
- PASS/FAIL/WARN/SKIP for each stage;
- environment/target;
- commit SHA;
- known limitations;
- remaining release gates.

Never use "looks good" as validation evidence.

## Interactive Product Verification checklist

When the task requires UI behavior, the agent should explicitly perform the product interaction.

Example:

- open the app;
- press the primary action / Play button;
- verify the expected screen or state appears;
- interact with the next control;
- verify visible state transitions;
- test the relevant empty/loading/error state;
- test refresh/persistence when relevant;
- inspect narrow/mobile layout when relevant;
- capture the observed result in the validation report.

The exact actions are project-specific and belong in the project's QA matrix.

## Release rule

The agent may recommend release only when:

- required automated checks PASS;
- required E2E/CVP checks PASS;
- required IPV scenarios PASS;
- deployment evidence exists;
- security/configuration checks are aligned;
- rollback evidence exists;
- unresolved warnings/skips are explicitly accepted.

## Repository retirement rule

Before recommending deletion of a legacy repository:

1. Confirm its functionality has been migrated.
2. Search the active project for references, URLs, dependencies, deployment hooks, CI workflows, environment variables, and documentation links.
3. Confirm production does not depend on it.
4. Preserve required history/export/archive evidence.
5. Disable external integrations that still point to it.
6. Only then propose deletion or archive.

Never delete a repository merely because it appears unused.
