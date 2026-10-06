# Roadmap — DayFlow

## Completed foundation

- [x] Repository baseline
- [x] Domain ownership
- [x] Today flow
- [x] Daily planning and execution states
- [x] Tasks
- [x] Schedule
- [x] Calendar .ics import
- [x] Reminders
- [x] Memory
- [x] Dashboard / Analytics
- [x] Admin / Access Manager
- [x] Responsive UI
- [x] PWA foundation
- [x] DayFlow-owned Firestore model
- [x] Feature-aware Firestore permissions
- [x] Production readiness tooling
- [x] CVP and production E2E

## Phase 17 — CVP Platform Foundation

- [x] Machine-readable DayFlow validation profile
- [x] Profile validator
- [x] Structural source checks
- [x] Command validation mode
- [x] Release gate declaration

## Phase 18 — PALMI-D3V Validation Framework

- [x] Shared validation terminology
- [x] V0–V8 validation model
- [x] Reusable project profile template
- [x] Agent implementation workflow
- [x] CVP vs E2E distinction
- [x] Interactive Product Verification (IPV)
- [x] Interactive Smoke Test (IST)
- [x] DayFlow mapped to shared validation contract
- [x] Legacy repository retirement procedure documented

## Next validation improvements

- [ ] Remove Node DEP0190 warning from the Windows validation runner without weakening process isolation.
- [ ] Resolve or intentionally document the four existing react-hooks/exhaustive-deps warnings in App.jsx.
- [ ] Add durable validation report artifacts for local/CI runs.
- [ ] Add project-specific IPV scenarios to other PALMI-D3V repositories.
- [ ] Extract shared runner code only when at least two projects need the same implementation rather than only the same contract.

## Product principle

DayFlow is the orchestration and memory layer. It should explain the day without becoming another task database or calendar database.
