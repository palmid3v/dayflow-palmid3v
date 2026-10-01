# 🌊 DayFlow — PALMI-D3V

**Plan → Do → Track → Remember**

DayFlow is the personal daily-orchestration application in the PALMI-D3V ecosystem.

## 🎯 Product Idea

DayFlow answers:

> **What is my day supposed to look like, what actually happened, and what should I remember from it?**

Core loop:

~~~text
📅 Calendar + 🔔 Reminders + ✅ To-Do
                    ↓
               🌅 Daily Plan
                    ↓
                ▶️ Execution
                    ↓
                 📊 Tracking
                    ↓
                📝 Memory
~~~

## 🧭 Current State

The repository was created with:

~~~text
dayflow-palmid3v/
├── app/
└── archive/
~~~

An initial visual MVP exists in **PR #1**, branch **feature/dayflow-mvp**.

Prototype features:

- 📱 Mobile-first dashboard
- 📅 Daily timeline
- 📊 Daily progress
- ✅ Interactive task surface
- 📝 Daily Memory concept
- 🧭 Today / Calendar / Tasks / Memory navigation
- ✨ Emoji activity categories
- 🌑 Dark dashboard language
- 🔗 Planned To-Do integration

### ⚠️ Structural note

The prototype currently lives at the repository root on the feature branch. **Do not merge PR #1 as-is.** It must be reorganized into **app/** before the MVP is structurally complete.

## 🛠️ Target Technology

Use the shared PALMI-D3V stack:

- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS
- 📱 Mobile-first
- 📦 PWA
- 💾 Local-first persistence
- ✨ Lucide React
- 🧹 ESLint
- 🧪 Build/lint validation

Target:

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

## 🔗 To-Do Integration

Task repository: **palmid3v/to-do**

To-Do is being modernized separately to the same stack.

Boundary:

- **To-Do:** owns tasks.
- **DayFlow:** orchestrates the day around them.

DayFlow must not create a competing task system.

## 🧩 Core Domains

### 📅 Calendar
Scheduled blocks and events.

### 🔔 Reminders
Time-sensitive prompts that are not necessarily tasks.

### ✅ Tasks
Tasks supplied by To-Do.

### 📊 Daily Tracking
Planned activity vs actual execution.

### 📝 Daily Memory
A written record based on what was planned, completed, skipped, changed, and noted.

~~~text
Planned + Completed + Skipped + Changed + Notes
                         ↓
                  📝 Daily Memory
~~~

## 🎨 Visual Direction

- 🌑 focused
- ✨ polished
- 📱 mobile-first
- 🧭 calm and navigable
- 🧩 dense without clutter
- 😊 expressive through emojis and activity icons

Use **Lucide React** for interface icons.

External visual assets are allowed when useful, but source/license/reference must be documented. Prefer lightweight attributable assets.

## 🛣️ Roadmap

### Phase 0 — Foundation
- [x] Repository
- [x] Product definition
- [x] Initial visual prototype
- [ ] Move app into app/
- [ ] Establish final React/Vite/Tailwind/PWA architecture

### Phase 1 — To-Do
- [ ] Coordinate with modernized To-Do
- [ ] Define task integration contract
- [ ] Avoid duplicate persistence

### Phase 2 — Planning
- [ ] Calendar model
- [ ] Reminder model
- [ ] Daily plan
- [ ] Planned vs actual states

### Phase 3 — Tracking
- [ ] Execution tracking
- [ ] Completion metrics
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
- [ ] Sync strategy if needed

## 🧠 Product Principle

DayFlow is **not another To-Do list**.

It turns:

> **things I planned + things I did**

into:

> **a meaningful record of my day.**

See **CONTEXT.md** for the full AI-development context.

---

**PALMI-D3V · DayFlow**  
*Plan your day. Live it. Remember it.* 🌊📝
