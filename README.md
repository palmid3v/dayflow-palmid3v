# 🌊 DayFlow — PALMI-D3V

**Plan → Do → Track → Remember**

DayFlow is the daily-orchestration layer of the PALMI-D3V productivity ecosystem.

> What was planned, what actually happened, and what should be remembered?

## Architecture

To-Do owns task creation, state, completion, lifecycle, and persistence. DayFlow owns calendar blocks, reminders, daily planning, planned-vs-actual tracking, review, and written memory. DayFlow must not create a second task database.

## Foundation

The application lives under `app/` and uses React 19, Vite 7, Tailwind CSS 4, vite-plugin-pwa, Lucide React, ESLint, and local-first persistence.

Implemented foundation: Today dashboard, daily timeline, To-Do read adapter, explicit ownership contract, Calendar surface, Tasks integration surface, Daily Memory notes, DayFlow LocalStorage store, PWA foundation, and domain definitions.

## Development

```bash
cd app
npm install
npm run dev
npm run lint
npm run build
```

## Roadmap

### Phase 0 — Foundation
- [x] Product definition
- [x] Visual prototype
- [x] Move application into `app/`
- [x] Establish React/Vite/Tailwind/PWA architecture
- [x] Define DayFlow domain boundaries

### Phase 1 — To-Do Integration
- [x] Preserve To-Do ownership
- [x] Define integration contract
- [x] Add read adapter
- [ ] Establish cross-application provider/bridge
- [ ] Define task scheduling ownership

### Phase 2 — Planning
- [x] Initial calendar-block model
- [ ] Calendar persistence
- [ ] Reminder model and persistence
- [ ] Daily plan persistence
- [ ] Planned vs actual snapshots

### Phase 3 — Tracking
- [x] Initial execution states
- [x] Daily progress
- [ ] Durable daily results
- [ ] Daily review workflow
- [ ] Metrics/history

### Phase 4 — Memory
- [x] Manual daily notes
- [ ] Memory model
- [ ] Generated daily summary
- [ ] Historical memory browser

### Phase 5 — PWA
- [x] Manifest
- [x] Service worker foundation
- [ ] Offline validation
- [ ] Installability validation
- [ ] Sync strategy if required

**PALMI-D3V · DayFlow** — *Plan your day. Live it. Remember it.* 🌊📝
