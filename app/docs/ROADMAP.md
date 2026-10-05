# Roadmap — DayFlow

## Phase 0 — Audit
- [x] Repository baseline
- [x] Domain ownership
- [x] Existing To-Do bridge documented

## Phase 1 — Product
- [x] Today flow
- [x] Daily planning
- [x] Execution states
- [x] Reminders
- [x] Daily review
- [x] Memory
- [x] To-Do read-only context

## Phase 2 — UX/UI
- [x] Today-first navigation
- [x] Calendar planning view
- [x] Tasks view
- [x] Memory/review view
- [x] Responsive layout
- [x] Theme persistence
- [x] PWA foundation

## Phase 3 — Architecture & data
- [x] DayFlow-owned data model
- [x] User-scoped Firestore target
- [x] taskId reference contract
- [x] occurrenceId reference contract
- [x] No-duplicate-ownership rule
- [x] Local preservation/migration rule

## Phase 7 — Dashboard / Analytics
- [x] Completion rate
- [x] Plan adherence
- [x] Days completed
- [x] Current streak
- [x] Weekly consistency

## Phase 8 — Admin / Access Manager 2.0
- [x] Unified DayFlow account list
- [x] Pending / active / suspended status
- [x] Per-feature access controls
- [x] Account search and status filtering
- [x] Admin account totals
- [x] Admin bypass for feature authorization

## Phase 4 — Ecosystem integration
- [x] Shared Firebase identity + verified email
- [x] App-level access gate
- [ ] Replace browser bridge with authenticated references
- [ ] Connect Timetable occurrences
- [x] Persist DayFlow plans/results/memory/reminders in Firestore
- [ ] Add cross-app recovery/export
- [ ] Add Google Calendar adapter where DayFlow needs it
- [ ] Add email delivery adapter where DayFlow needs it
- [ ] End-to-end integrity tests

## Product principle

DayFlow is the orchestration and memory layer. It should explain the day without becoming another task database or calendar database.
