# PALMI-D3V Validation Workflow for Agents

Use this file as the project-entry workflow when working on a PALMI-D3V repository.

## Required reading

1. validation/README.md
2. validation/PALMI-D3V_VALIDATION_FRAMEWORK.md
3. validation/PALMI-D3V_AGENT_WORKFLOW.md
4. The project's validation profile.
5. The project's README and QA/release documentation.

## Required behavior

- Treat the validation profile as the project's executable contract.
- Identify affected validation levels before implementation.
- Preserve existing validation behavior unless the task intentionally changes it.
- Add tests for new deterministic behavior.
- Add/update CVP coverage for changes to critical journeys.
- Add/update E2E coverage for cross-boundary workflows.
- Add/update IPV scenarios for UI interaction, visual state, responsive, PWA, or device behavior.
- Never claim a validation stage passed without executing it or having explicit CI evidence.
- Report FAIL, WARN, and SKIP separately.
- Keep secrets out of code, profiles, logs, and reports.

## Standard execution order

Repository contract
→ Domain validation
→ Static quality
→ Build/artifact
→ Integration
→ CVP
→ E2E
→ Interactive Product Verification
→ Production Acceptance

## Interactive Product Verification

When a task involves UI behavior, perform an actual interaction scenario when the environment permits it.

Do not reduce this to DOM assertions only.

Example:

1. Open the application.
2. Authenticate if needed.
3. Press the primary Play/start action when applicable.
4. Observe the visible state transition.
5. Perform the relevant user action.
6. Verify the visible result.
7. Check the relevant loading/empty/error/disabled state.
8. Refresh when persistence matters.
9. Repeat at a narrow/mobile viewport when responsive behavior is affected.

Record the scenario and result as IPV/IST evidence.

## Release rule

Do not recommend release until all required profile levels and release gates pass, or every exception is explicitly documented and accepted.

## Legacy repository rule

Never delete a legacy repository because it "looks unused".

Before retirement, prove:

- no runtime imports/dependencies;
- no CI or deployment references;
- no environment-variable dependency;
- no Firebase/Vercel integration dependency;
- no documentation or operational dependency;
- migrated functionality is covered by the active project's validation suite;
- required history/export/archive is preserved.

Only then recommend archive/deletion.
