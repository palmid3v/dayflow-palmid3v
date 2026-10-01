# DayFlow ↔ To-Do Integration Contract

**Version:** 1.0.0

## Ownership

| Capability | Owner |
|---|---|
| Create task | To-Do |
| Edit task | To-Do |
| Complete task | To-Do |
| Persist task | To-Do |
| Schedule task | DayFlow |
| Reminders | DayFlow |
| Daily planning | DayFlow |
| Execution tracking | DayFlow |
| Daily review | DayFlow |
| Memory | DayFlow |

DayFlow must never create a second authoritative task database.

## Provider contract

DayFlow exposes a read-only provider slot:

`window.__PALMI_D3V_TODO_PROVIDER__`

The provider must implement:

```js
{
  getTasks: () => Task[]
}
```

Tasks are normalized to:

```js
{
  id: string,
  title: string,
  completed: boolean,
  createdAt: string | null,
  updatedAt: string | null
}
```

The DayFlow adapter also exports `registerTodoProvider(provider)` for same-origin application integration.

## Fallback

Until the production To-Do application registers a provider, DayFlow can read the existing `TODO` localStorage snapshot. This fallback is intentionally read-only.

## Scheduling rule

When DayFlow eventually schedules a To-Do task, it stores only the task reference and scheduling metadata in DayFlow. It does not copy the task record.

Example:

```js
{
  taskId: "todo-123",
  scheduledFor: "2026-10-01T16:00:00",
  executionState: "planned"
}
```

## Cross-application boundary

The provider is the integration boundary. Any future authenticated/API/sync transport can replace the browser bridge without changing DayFlow's domain ownership.
