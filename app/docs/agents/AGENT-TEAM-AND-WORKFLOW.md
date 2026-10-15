# DayFlow — Agent Team and Delivery Workflow

Use no more than five agents. Agents are work roles, not an excuse for parallel writes to the same files. One coordinator owns architecture decisions, branch integration and release sign-off.

## Roles

1. **Coordinator / Architect** — owns scope, module contracts, sequencing, PR review and release decisions. Avoids simultaneous edits to shared files.
2. **Firebase / Security** — Firestore schema, security rules, Auth/access checks, Rules Unit Testing and data migration.
3. **Tasks / Schedule** — task domain integration, recurrence, occurrence handling, ICS export and data compatibility.
4. **UX / Accessibility** — retro-dark design tokens, responsive layouts, interaction states, reduced-motion behavior and keyboard/accessibility verification.
5. **QA / Release** — unit/CVP/E2E, build/lint, manual IPV checklist, preview verification, deployment evidence and rollback readiness.

## Operating rules

- main is the source of truth; read current code and latest commits before each task.
- One active implementation branch per coherent task; use small PRs with explicit acceptance criteria.
- Assign non-overlapping file ownership while work is parallel.
- Do not run simultaneous agents against the same Firestore Rules file or app shell.
- Security/Rules changes require the Security role and a separate review by the Coordinator.
- No agent may assert production is verified unless it has actual deployment evidence.
- Never print or commit .env secrets, Firebase Admin credentials, user data, exports, or production fixtures.
- Keep dependencies stable during functional migration; version upgrades are separate work.
- Use a dedicated Firebase test project or Emulator Suite; do not test destructive migrations on production.
- Any schema migration must be idempotent, observable, backed up, and reversible where feasible.
- Before completing a task, state: files changed, tests run, results, known risks, and exact next step.

## Standard task handoff

Each issue/task must include:
- Goal and non-goals
- Current source files and data contract
- Allowed files/paths
- Acceptance criteria
- Tests/commands
- Data/security impact
- Rollback note

## Merge gates

npm run lint → unit tests → Firestore Rules tests → build → CVP → Playwright E2E → manual IPV → preview deployment checks.

Use only scripts available in the current app/package.json; do not assume commands from older project versions exist.
