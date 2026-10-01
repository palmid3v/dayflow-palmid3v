# DayFlow ↔ To-Do Integration Contract

**Version:** 1.1.0 · Phase 1–3 baseline

## Ownership

| Capability | Owner |
|---|---|
| Create task | To-Do |
| Edit task | To-Do |
| Complete task | To-Do |
| Persist task | To-Do |
| Daily planning | DayFlow |
| Scheduling metadata | DayFlow |
| Reminders | DayFlow |
| Execution tracking | DayFlow |
| Daily review | DayFlow |
| Memory | DayFlow |

## Reference contract

DayFlow consumes a normalized task reference:

~~~js
{
  id: string,
  title: string,
  completed: boolean,
  createdAt: string | null,
  updatedAt: string | null
}
~~~

The authoritative record remains in To-Do.

## Current transport

The production browser bridge uses:

- Channel: PALMI_D3V_TODO
- Version: 1.0.0
- DayFlow → To-Do: GET_TASKS
- To-Do → DayFlow: TASKS / TASKS_UPDATED

DayFlow validates origin and message source.

## Target transport

The bridge is transitional. The target is an authenticated shared reference:

~~~text
To-Do
  taskId
    │
    ▼
DayFlow daily plan
  executionState
  scheduledFor
  notes
~~~

DayFlow must not persist a second authoritative copy of the task.

## Timetable extension

The same rule applies to schedule data:

~~~text
Timetable
  occurrenceId
      │
      ▼
DayFlow daily plan
  executionState
~~~

Timetable remains authoritative for the occurrence.

## Migration rule

Replacing the transport must not delete the existing local source data until the new source has been verified.
