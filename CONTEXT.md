# CONTEXT — DayFlow

## Identity

- Product: DayFlow
- Ecosystem: PALMI-D3V productivity suite
- Role: Single productivity application and center of operations
- Developer: PALMI-D3V

## Product architecture

DayFlow is the only active PALMI-D3V productivity application.

Internal domains:
- Tasks
- Schedule
- Daily Flow
- Reminders
- Review
- Memory

To-Do and Timetable repositories remain migration sources during the transition. They are not active application dependencies.

## Data ownership

One Firebase project, one authenticated user, one Firestore database.

```text
users/{uid}/tasks/{taskId}
users/{uid}/timetableTemplates/{templateId}
users/{uid}/timetableOccurrences/{occurrenceId}
users/{uid}/timetableSettings/{document}
users/{uid}/timetableExternalLinks/{document}

users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{reminderId}
```

Tasks and recurring schedules are now consumed directly by DayFlow. No popup, postMessage bridge, duplicate authoritative store, or second frontend is required.

## Current state

- Unified DayFlow frontend: implemented
- Native Tasks domain: implemented
- Native Schedule domain: implemented
- Shared Firestore access: implemented
- Legacy To-Do bridge: removed
- Legacy repositories: preserved externally for migration/rollback
- Shared authentication: implemented
- Email verification: implemented
- App access control: implemented
- PWA foundation: implemented

## Structure rule

Prefer the smallest useful structure.

```text
app/src/
├── components/       # shared app/auth UI
├── features/
│   ├── tasks/        # task domain
│   └── schedule/     # recurring schedule domain
├── domain/           # DayFlow daily models
└── lib/              # shared Firebase + DayFlow persistence
```

Do not create another application for a new productivity capability when it can be an internal DayFlow feature.

## Development

```bash
cd app
npm install
npm run dev
npm run lint
npm run build
```

## Migration rule

Existing To-Do and Timetable repositories are migration sources only. Do not delete them as part of this codebase change. The owner will remove/archive them after the unified DayFlow application has been validated.

## Future integrations

Google Calendar, email, notifications, and other external services belong behind DayFlow integration adapters. External providers are never the source of truth for PALMI-D3V productivity data.
