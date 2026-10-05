# DayFlow — CVP Project Context

## Product

DayFlow is the PALMI-D3V central productivity application.

It combines:

- Today
- Tasks
- Schedule
- Calendar / ICS import
- Reminders
- Memory
- Dashboard
- Admin / Access Manager

## Product principles

- One central product instead of fragmented productivity apps.
- React + Vite + Tailwind.
- Firebase Authentication + Firestore.
- PWA support.
- Dark theme.
- Mobile-first responsive behavior.
- Production-oriented validation.
- Avoid unnecessary dependencies and architecture changes.
- Keep Firebase paths and access rules aligned with the application.

## Validation priorities

1. Authentication and authorization.
2. Firestore persistence and permissions.
3. Today / Tasks / Schedule CRUD.
4. Calendar import, projection, replacement, and clear.
5. Reminders and notifications.
6. Memory persistence.
7. Dashboard calculations.
8. Admin feature permissions and audit.
9. PWA generation and installability.
10. Responsive behavior.
11. Production deployment health.
12. Rollback readiness and release evidence.

## QA data

Automated E2E data uses QA prefixes and should be removed or neutralized before the run finishes.

## Release principle

Do not call DayFlow production-ready because local tests pass. Production readiness requires source validation, deployment validation, Firebase rules alignment, production E2E evidence, manual smoke testing, and rollback readiness.

## Phase 16 release evidence

A production release should retain:

- CVP automated validation report.
- GitHub CI result.
- Vercel production deployment result.
- Firebase rules deployment confirmation.
- Manual smoke-test result.
- Approved release commit SHA.
