# 🌊 PALMI-D3V DayFlow

**Plan → Do → Track → Remember.**

DayFlow is the daily-orchestration and memory layer of PALMI-D3V.

## 🎨 Visual mockup

~~~text
┌──────────────────────────────────────────────┐
│ 🌊 DAYFLOW · Thursday                       ⚙️│
├──────────────────────────────────────────────┤
│ TODAY'S FLOW                         72%  ◉   │
│ 08:00 🏋️ Training              ✓             │
│ 10:00 💻 Deep work             ✓             │
│ 13:00 🍽️ Lunch                 →             │
│ 16:00 🚀 Project               →             │
│                                              │
│ 🔔 Reminders   ✅ To-Do   📝 Memory          │
└──────────────────────────────────────────────┘
~~~

## 🎯 Product boundary

| Product | Owns |
|---|---|
| ✅ To-Do | tasks, completion, lifecycle |
| 🗓️ Timetable | recurring schedule, occurrences |
| 🌊 DayFlow | daily plan, execution, review, memory |
| 📅 Google Calendar | external calendar surface |
| ✉️ Email | delivery transport |

DayFlow references source records; it does not duplicate their authoritative data.

## ✅ Phases 1–3

**Closed:** Product, UX/UI, and Architecture & Data.

Implemented baseline:
- Today-first daily flow
- calendar planning view
- execution states
- reminders
- To-Do read-only context
- daily review and memory
- persistent theme
- responsive PWA interface
- local persistence and recovery
- Firestore persistence for DayFlow-owned domain data
- shared app-level access control
- consistent Sign out UX across auth states
- documented cross-app contract

Full closure: app/docs/PHASES_1_3.md

## 🔐 Shared account and access control

All PALMI-D3V applications use the same Firebase Authentication identity and Firestore access registry.

~~~text
Firebase Auth
    │
    ├── platformAdmins/{uid} → platform administrator
    │
    └── appAccess/{uid}
          ├── timetable: true/false
          ├── todo: true/false
          └── dayflow: true/false
~~~

### Automatic vs manual initialization

- 👑 `platformAdmins/{uid}` is a **manual one-time bootstrap** for the platform owner.
- 👤 `appAccess/{uid}` is **created automatically** for a verified non-admin on first app entry.
- 🔁 The first app creates the shared record; the other apps reuse it.
- 🚫 The administrator does not need `appAccess/{uid}`.
- ☁️ DayFlow domain records are now persisted in Firestore; `localStorage["DAYFLOW"]` remains the recovery/cache layer. Firestore creates collections/documents implicitly on first write.

Administrators are identified by `platformAdmins/{uid}` and can enter/manage every PALMI-D3V app regardless of individual app flags.

Firestore Rules remain the authoritative security boundary; the UI never grants permissions by itself.

## 🚪 Authentication UX

DayFlow exposes Sign out in the authenticated header, Access pending state and email verification state with the same high-contrast treatment used by the other PALMI-D3V apps.

## 🔗 Data model

DayFlow-owned targets:

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

References:

~~~text
To-Do taskId ─────────────► daily plan
Timetable occurrenceId ──► daily plan
~~~

The source app remains authoritative.

## 🔐 Ecosystem

~~~text
🔐 Firebase Auth
       │
       ▼
☁️ Firestore
 ┌─────┼─────────┐
 ▼     ▼         ▼
To-Do Timetable DayFlow
 tasks schedule  daily flow
~~~

The current browser bridge is transitional. Authenticated shared references are the next integration step.

## ✉️ Weekly summary

DayFlow contributes cloud data to the shared weekly summary backend: planned/reviewed days, block outcomes, open reminders and recent memory summaries. The backend is scheduled for Sunday 20:00 America/Bogota after Firebase Functions and Resend server configuration are deployed.

## ✉️ Notifications

Email is the target notification channel. Resend remains the external delivery adapter. API credentials remain server-side.

## 📅 Calendar

Google Calendar is an external adapter. Initial direction: PALMI-D3V → Google Calendar, with stable external IDs before bidirectional sync.

## 🧱 Stack

React 19 · Vite 7 · Tailwind CSS 4 · PWA · Firebase Auth · Cloud Firestore · Lucide React · ESLint

## ▶️ Development

~~~powershell
cd app
npm install
npm run dev
npm run lint
npm run build
~~~

## 📚 Documentation

- app/docs/PHASES_1_3.md
- app/docs/FIREBASE_ARCHITECTURE.md
- app/docs/INTEGRATION_CONTRACT.md
- app/docs/ROADMAP.md

**Current release:** v0.2.0 · shared access control verified · DayFlow Firestore persistence active · auth UX hardened.

## 🌐 Deployment boundaries

Vercel deploys the browser application. Firebase CLI deploys Rules and the shared scheduled Functions backend.

## Access provisioning

New Firebase Authentication users are automatically provisioned into the shared `appAccess/{uid}` record when they enter the app, even before email verification is completed. The initial access state is:

```
timetable: false
todo: false
dayflow: false
```

Email verification is still required before application data can be accessed. The platform admin is controlled separately by `platformAdmins/{uid}` and does not require an `appAccess` record.

### Access flow

```
👤 New account
   │
   ▼
🔐 Firebase Auth
   │
   ▼
🧾 appAccess/{uid}
   ├── TimeTable  ❌
   ├── To-Do      ❌
   └── DayFlow    ❌
   │
   ▼
📧 Verify email
   │
   ▼
🛡️ Admin enables the required apps
   │
   ▼
🚀 App access
```

This provisioning record is intentionally separate from the platform-admin record. Security Rules continue to require verified email plus explicit app access for application data.
