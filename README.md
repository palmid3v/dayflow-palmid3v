# 🌊 DayFlow — PALMI-D3V

**Plan → Do → Track → Remember**

DayFlow is the **daily-orchestration and memory layer** of the PALMI-D3V productivity ecosystem.

## 🎨 Visual mockup

```text
┌────────────────────────────────────────────────┐
│ 🌊 PALMI-D3V · DAYFLOW             ⚙️          │
│ Thursday · Your day, in one flow               │
├────────────────────────────────────────────────┤
│ TODAY'S FLOW                         72%  ◉      │
│                                                │
│ 08:00 🏋️ Morning training       ✓ completed    │
│ 10:00 💻 Deep work              ✓ completed    │
│ 13:00 🍽️ Lunch                   → planned      │
│ 16:00 🚀 Project work            → planned      │
│                                                │
│ 🔔 Reminders        ✅ To-Do        📝 Memory   │
└────────────────────────────────────────────────┘
```

## 🧩 Product boundary

| Product | Owns |
|---|---|
| ✅ To-Do | tasks, completion, lifecycle, persistence |
| 🗓️ Timetable | recurring schedule, occurrences, schedule history |
| 🌊 DayFlow | daily plan, execution, review, memory |
| 📅 Google Calendar | external calendar surface |
| ✉️ Email provider | notification transport |

DayFlow should **reference** tasks and schedule occurrences. It must not create duplicate task or schedule databases.

## 🏗️ Shared ecosystem

```text
                 🔐 Firebase Auth
                       │
                       ▼
                ☁️ Firestore
             shared user identity
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      To-Do         Timetable       DayFlow
       tasks        schedule        daily flow
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  📅 Google Calendar          ✉️ Email
                    external adapter          delivery
```

This is intentionally **not** one giant application. The products remain independently deployable and independently understandable.

An API/serverless boundary is reserved for systems that require secrets or OAuth, such as Google Calendar and email delivery. The three browser applications do not need a REST API just to talk to each other when authenticated Firestore references can express the relationship safely.

## 🔗 Data relationships

Example:

```text
To-Do task
  id = todo-123
       │
       └──── referenced by ────► DayFlow daily block

Timetable occurrence
  id = occ-2026-10-01-go
       │
       └──── referenced by ────► DayFlow daily plan
```

DayFlow records **what happened during the day** without taking ownership of the source records.

## 💾 Persistence direction

Firebase Authentication is already present at the application boundary.

DayFlow-owned data is intended for user-scoped Firestore:

```text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
```

To-Do owns:

```text
users/{uid}/tasks/{taskId}
```

Timetable will own its own schedule collections under the same user.

The browser bridge remains transitional until shared authenticated references are fully implemented.

## 📅 Google Calendar

Google Calendar should be treated as an external synchronization adapter.

The intended first direction is:

**PALMI-D3V → Google Calendar**

with stable external IDs and sync metadata. Google Calendar access requires OAuth authorization with the scopes needed by the operations we perform. citeturn0search5turn0search12

## ✉️ Email notifications

The target notification mechanism is email rather than browser notifications.

Resend currently lists a free tier of 3,000 transactional emails/month and 100/day, and supports scheduled email delivery. citeturn0search0turn3search4

The sender should be a dedicated PALMI-D3V address/domain, while the recipient can be the personal inbox chosen in the application.

The API key belongs only in the server-side environment.

## 🚀 Stack

- React 19
- Vite 7
- Tailwind CSS 4
- vite-plugin-pwa
- Lucide React
- Firebase Authentication / Firestore readiness
- Local-first persistence during migration
- ESLint

## Development

```powershell
cd app
npm install
npm run dev
npm run lint
npm run build
```

## Current status

**Status:** 🟢 Core product foundation and To-Do integration are implemented.

The next ecosystem work is to complete Timetable persistence and replace transitional browser bridges with durable shared references.

## Roadmap

### Ecosystem phase
- [x] Preserve To-Do ownership
- [x] Define DayFlow domain ownership
- [x] Define shared Firebase identity/persistence direction
- [ ] Connect Timetable as a first-class domain
- [ ] Replace copied task snapshots with shared references
- [ ] Add schedule-occurrence references
- [ ] Add Google Calendar OAuth adapter
- [ ] Add email delivery adapter
- [ ] Add recovery/export tooling
- [ ] Validate cross-app data integrity

---

**PALMI-D3V · DayFlow** — *Plan your day. Live it. Remember it.* 🌊📝
