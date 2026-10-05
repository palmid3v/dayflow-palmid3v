# 🌊 DayFlow — PALMI-D3V Productivity

DayFlow is the **single productivity application** for the PALMI-D3V ecosystem.

Tasks, recurring schedules, daily planning, reminders, review, and memory live inside one React/Vite application backed by one Firebase Authentication identity and one Cloud Firestore database.

> **Current status:** Unified product architecture and production-readiness tooling are implemented through Phase 16. DayFlow includes the design/UX system, responsive mobile-first shell, installable PWA metadata, offline navigation support, admin analytics, audited access management, feature-aware cloud permissions, browser reminder notifications, automated validation, and a production release checklist. To-Do and Timetable remain separate repositories only as migration/rollback sources; they are no longer runtime dependencies of DayFlow.

## Product modules

- 🏠 Today — daily orchestration
- ✅ Tasks — task creation, editing, completion, and lifecycle
- 🗓️ Schedule — recurring weekly timetable and imported calendar events
- 📥 Calendar Import — import standard .ics calendar snapshots without Google OAuth or Calendar API
- 🔔 Reminders — daily prompts, recurrence, overdue state, and optional browser notifications
- 🧠 Memory — daily review and history
- 📊 Dashboard — weekly productivity metrics
- 🛡️ Admin / Access Manager — account access, feature permissions, analytics, and audit
- ⚙️ Settings — shared application configuration

## Production readiness

Phase 16 adds:

- app/docs/PHASE_16_PRODUCTION_READINESS.md — production release gates and evidence requirements.
- app/scripts/Validate-ProductionReadiness.ps1 — local production-readiness checks for Firebase configuration, Vercel configuration, PWA build output, and production reachability.
- Updated release and QA documentation for authentication, Firestore, Vercel, PWA, smoke testing, and rollback.

The Phase 16 validator does not store or print secrets and does not claim that Firebase rules are deployed. Deployment confirmation remains an operational release gate.

## Unified architecture rules

1. DayFlow is the only active frontend.
2. One Firebase project and one Firestore database.
3. One authentication system.
4. Tasks and schedules are internal DayFlow domains.
5. Calendar imports use standard .ics files; Google OAuth and the Google Calendar API are intentionally not required for the current release.
6. No popup or postMessage bridges between PALMI-D3V apps.
7. No duplicated authoritative records.
8. New productivity features become DayFlow modules.
9. Keep the file structure small and responsibility-driven.
10. External integrations are adapters, not sources of truth.
11. Admin access changes are audited and feature permissions are enforced at the Firestore boundary.
12. Vercel deployments should only run when the app directory changes.
13. The UI uses a dark-only visual system with shared design tokens and mobile-safe-area support.
14. PWA updates are automatic and the app keeps a local-first experience when cloud access is unavailable.
15. Production approval requires deployment and manual evidence in addition to source/build validation.

## Development

    cd app
    npm install
    npm run dev
    npm run lint
    npm run build

### Production-readiness validation

From the repository root:

    .\app\scripts\Validate-ProductionReadiness.ps1

Optional production URL override:

    .\app\scripts\Validate-ProductionReadiness.ps1 -ProductionUrl "https://your-production-url"

## Migration repositories

The previous repositories remain untouched for now:

- palmid3v/to-do-palmid3v
- palmid3v/timetable-palmid3v

They are migration references and rollback sources until the unified DayFlow implementation is validated.

### Phases 11–16

- **Phase 11 — Design System / UX System:** centralized visual tokens, reusable surface/control patterns, focus states, motion preferences, and consistent responsive spacing.
- **Phase 12 — Responsive / PWA:** mobile-first navigation, safe-area handling, touch-friendly controls, install metadata, automatic service-worker updates, and SPA offline navigation fallback.
- **Phase 15 — CVP:** automated validation, E2E coverage, production validation prerequisites, and release hardening.
- **Phase 16 — Production Readiness:** deployment gates, smoke-test evidence, PWA/runtime checks, Firebase/Vercel verification, and rollback readiness.

### Calendar import

DayFlow accepts .ics files directly in Schedule. Google Calendar supports exporting calendars as .ics files, including recurring-event data; the imported snapshot is stored in DayFlow and is not live-synchronized. Re-import the latest .ics file when the external calendar changes.

---

**PALMI-D3V · DayFlow · 2026**
