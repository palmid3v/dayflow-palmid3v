# 🧠 DayFlow — PALMI-D3V Chat Context

> Paste this into a new development chat before making changes.

## Identity

- Repository: **palmid3v/dayflow-palmid3v**
- Product: **DayFlow**
- Role: daily orchestration, tracking, and written-memory layer
- Default branch: **main**
- Prototype branch: **feature/dayflow-mvp**
- Current PR: **#1 — feat: DayFlow mobile-first MVP foundation**

## Product Definition

~~~text
PLAN → DO → TRACK → REMEMBER
~~~

DayFlow combines:

- 📅 Calendar
- 🔔 Reminders
- ✅ To-Do tasks
- 🌅 Daily planning
- 📊 Execution tracking
- 📝 Written daily memory

Key question:

> **What was planned, what actually happened, and what should be remembered?**

## Existing Prototype

The feature branch prototype contains:

- package.json
- index.html
- src/main.jsx
- src/styles.css
- README.md

It demonstrates:

- Today dashboard
- Daily progress
- Timeline
- Interactive tasks
- Daily Memory card
- Calendar/Tasks/Memory navigation
- Emoji activity categories
- Dark mobile-first styling

### ⚠️ Structural warning

The prototype is currently at repository root.

**Do not merge PR #1 as-is.**

Required structure:

~~~text
dayflow-palmid3v/
├── app/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.*
│   └── ...
├── archive/
└── README.md
~~~

## Definitive Technology

Use:

**React + Vite + Tailwind CSS + PWA + Local-first persistence + Lucide React + ESLint**

Do not introduce unnecessary frameworks or change the stack without a concrete reason.

## To-Do Relationship

Task repository: **palmid3v/to-do**

To-Do is currently a legacy vanilla HTML/CSS/JavaScript + LocalStorage application and is being modernized in a separate chat.

### Ownership

**To-Do owns:**
- task creation
- task state
- completion
- lifecycle
- persistence

**DayFlow owns:**
- calendar blocks
- reminders
- daily orchestration
- planned vs actual tracking
- daily review
- written memory

Never duplicate the task system unnecessarily.

## Core Data Concepts

### Task
Something that can be completed.

### Event / Calendar Block
Something scheduled at a time.

### Reminder
A prompt associated with a future moment or condition.

### Daily Plan
The planned composition of tasks, events, and reminders for a day.

### Daily Result
What actually happened.

### Daily Memory
A human-readable record derived from the daily plan and daily result.

Do not collapse these into one generic object merely for convenience.

## Daily Memory

The defining feature is converting activity into a written record:

~~~text
Planned
   +
Completed
   +
Skipped
   +
Changed
   +
Notes
   ↓
📝 Daily Memory
~~~

The memory should represent the actual day, not simply copy the planned schedule.

## UX Direction

Primary navigation:

~~~text
🏠 Today
📅 Calendar
✅ Tasks
📝 Memory
~~~

Future:

~~~text
⚙️ Settings
~~~

Visual direction:

- dark dashboard
- rounded cards
- clear hierarchy
- timeline daily view
- large touch targets
- restrained information density
- emojis for personality
- Lucide for interface controls

## Asset Rules

External images/icons may be used when useful.

For external assets:

- document source
- document license/usage basis when relevant
- avoid copied/watermarked assets
- prefer lightweight SVG/icon assets
- keep attribution/reference information when needed

## Roadmap

### Phase 0 — Foundation
- [x] Repository
- [x] Product definition
- [x] Initial visual prototype
- [ ] Reorganize prototype into app/
- [ ] Establish final React/Vite/Tailwind/PWA architecture

### Phase 1 — To-Do Integration
- [ ] Coordinate with modernized To-Do
- [ ] Define shared task contract
- [ ] Integrate without duplicate task storage

### Phase 2 — Planning
- [ ] Calendar model
- [ ] Reminder model
- [ ] Daily plan
- [ ] Planned vs actual state

### Phase 3 — Tracking
- [ ] Execution tracking
- [ ] Daily metrics
- [ ] Daily review

### Phase 4 — Memory
- [ ] Memory model
- [ ] Generated summary
- [ ] Manual notes
- [ ] History

### Phase 5 — PWA
- [ ] Offline
- [ ] Installability
- [ ] Persistence
- [ ] Sync strategy if required

## Current Status

**Product:** Defined.

**Repository:** Created.

**Visual prototype:** Built on feature/dayflow-mvp.

**PR:** #1 open.

**Production architecture:** Not finalized.

**To-Do integration:** Planned, not implemented.

**Calendar:** Not implemented.

**Reminders:** Not implemented.

**Tracking:** Prototype only.

**Written memory:** Concept/prototype only.

## Immediate Next Step

1. Restructure prototype into app/.
2. Establish React/Vite/Tailwind/PWA correctly.
3. Review modernized To-Do contract.
4. Define DayFlow domain models.
5. Implement Calendar, Reminders, Tracking, and Memory.

## Working Rules

- Keep mobile-first.
- Keep UI polished but practical.
- Use emojis intentionally.
- Avoid duplicate To-Do.
- Avoid premature backend complexity.
- Prefer local-first initially.
- Keep docs synchronized.
- Validate build/lint.
- Keep archive for history.
- Do not merge the initial prototype until structure is corrected.

## Definition of Success

DayFlow should show:

**What is happening today → what needs attention → what has happened → what the day became.**

At the end:

> **DayFlow turns the day into a memory.** 🌊📝
