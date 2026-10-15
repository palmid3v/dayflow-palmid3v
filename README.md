# DayFlow — PALMI-D3V Productivity

DayFlow is the canonical application for the PALMI-D3V productivity suite. Tasks, recurring schedules, daily planning, reminders, review, calendar imports, dashboard and memory belong in one React/Vite/PWA frontend using Firebase Authentication and Cloud Firestore.

## Current direction

- DayFlow is the application users launch.
- To-Do and Timetable remain migration/rollback sources until their stored data, permissions, integrations, deployments and history are verified.
- Their functions are being consolidated into DayFlow feature modules; their separate frontends are not runtime dependencies.
- Keep the Firebase JS SDK and current host toolchain stable during migration. Do not add paid infrastructure as a requirement.
- $0 is a hard operating constraint: avoid mandatory paid services and do not assume Cloud Functions email delivery can remain active without an approved free alternative.

The architecture and much of the feature structure are already present. Unification is **not considered complete** until the migration risks and release gates documented in app/docs/audits/UNIFICATION-AUDIT-2026-10.md are closed.

## Architecture

    DayFlow
    ├── Today / daily execution
    ├── Tasks
    ├── Schedule / recurring blocks
    ├── Calendar (ICS)
    ├── Reminders
    ├── Memory / daily review
    ├── Dashboard
    └── Shared Firebase Auth, Firestore repositories and access policy

Canonical data is user-scoped. Keep users/{uid}/tasks/{taskId} as the task collection and use task IDs for references instead of duplicating task documents. Schedule records remain in their own collections. DayFlow currently uses dayflowPlans, dayflowResults, dayflowMemories, dayflowReminders and calendar import/event paths; legacy nested paths must be inventoried before migration or retirement.

## Validation

From app/:

    npm ci
    npm run validate:static
    npm run test:cvp
    npm run test:e2e
    npm run validate

npm run validate:static covers unit tests, lint and production build. The full npm run validate additionally requires a dedicated QA account or a stored Playwright authentication state for CVP and full E2E. A CI run that skips those tests is not evidence that the complete user journeys passed.

Release acceptance also requires Firebase Rules tests, manual Interactive Product Verification, responsive/keyboard/reduced-motion checks, deployment evidence and a rollback procedure.

## Development

    cd app
    npm install
    npm run dev
    npm run lint
    npm run build

## Migration repositories

- [To-Do](https://github.com/palmid3v/to-do-palmid3v)
- [Timetable](https://github.com/palmid3v/timetable-palmid3v)

Do not delete or archive these until functionality, data, history, active deployments and integrations have been verified. Preserve rollback capability during consolidation.

## Core documents

- app/docs/audits/UNIFICATION-AUDIT-2026-10.md — source-level findings and migration sequence.
- app/docs/design/RETRO-DARK-DESIGN-SYSTEM.md — visual system and interaction rules.
- app/docs/DEVELOPMENT-WORKFLOW.md — single-owner implementation and release process.
- app/docs/QA_MATRIX.md — automated and manual verification.
- app/docs/RELEASE_CHECKLIST.md — deployment and rollback acceptance.
- validation/PALMI-D3V_VALIDATION_FRAMEWORK.md — validation levels and evidence contract.

---

PALMI-D3V · DayFlow · 2026