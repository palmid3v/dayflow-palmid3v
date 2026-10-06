# 🌊 DayFlow — PALMI-D3V Productivity

DayFlow is the single productivity application for the PALMI-D3V ecosystem.

Tasks, recurring schedules, daily planning, reminders, review, and memory live inside one React/Vite application backed by one Firebase Authentication identity and one Cloud Firestore database.

> Current status: unified product architecture and production-readiness tooling are implemented through Phase 18. DayFlow includes automated validation, Critical Value Path (CVP), production E2E, Interactive Product Verification (IPV) guidance, PWA/responsive checks, and release evidence requirements. To-Do and Timetable are migration/rollback sources only; they are no longer runtime dependencies of DayFlow.

## PALMI-D3V Validation Framework

DayFlow is the reference implementation of the reusable PALMI-D3V Validation Framework.

Canonical framework documents:

- validation/PALMI-D3V_VALIDATION_FRAMEWORK.md — validation levels, terminology, gates, and evidence.
- validation/PALMI-D3V_AGENT_WORKFLOW.md — implementation-agent workflow.
- validation/PROJECT_VALIDATION_PROFILE.template.json — reusable project profile contract.
- validation/README.md — framework entry point.

The framework separates:

- CVP — critical journeys that prove core product value.
- E2E — complete workflows across the application boundary.
- IPV — Interactive Product Verification, where a human or agent operates the UI and verifies visible behavior.
- Production Acceptance — deployed-release verification, evidence, and rollback readiness.

### DayFlow validation commands

From app:

    npm run validate:static
    npm run test:cvp
    npm run test:e2e
    npm run validate

npm run validate is the main automated release runner: Unit → Lint → Build → CVP → Full Production E2E.

IPV remains an explicit release gate for UI/UX behavior that automated assertions cannot fully prove.

## Production readiness

Key validation tooling:

- app/scripts/Validate-ProductionReadiness.ps1
- app/scripts/Validate-CVPProfile.ps1
- app/scripts/validate.mjs
- app/cvp/DAYFLOW_PROFILE.json
- app/docs/QA_MATRIX.md
- app/docs/RELEASE_CHECKLIST.md

Validators do not store or print secrets and do not claim Firebase deployment without deployment evidence.

## Development

    cd app
    npm install
    npm run dev

### Validation

    npm run validate:static

For the complete automated suite, configure a dedicated QA account and run:

    npm run validate

For profile validation:

    .\scripts\Validate-CVPProfile.ps1
    .\scripts\Validate-CVPProfile.ps1 -RunCommands

## Migration repositories

The previous repositories remain migration/rollback sources until retirement is explicitly approved:

- palmid3v/to-do-palmid3v
- palmid3v/timetable-palmid3v

They are not runtime dependencies of DayFlow. Retirement requires dependency/reference/deployment verification and preservation of required history before deletion.

## Phases 15–18

- Phase 15 — CVP: automated validation, E2E coverage, production validation prerequisites, and release hardening.
- Phase 16 — Production Readiness: deployment gates, smoke evidence, PWA/runtime checks, Firebase/Vercel verification, and rollback readiness.
- Phase 17 — CVP Platform Foundation: machine-readable DayFlow validation profile and profile-driven structural validation.
- Phase 18 — PALMI-D3V Validation Framework: reusable validation contract, agent workflow, explicit IPV terminology, profile template, and DayFlow reference implementation.

---

PALMI-D3V · DayFlow · 2026
