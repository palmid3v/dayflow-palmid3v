# Firebase Architecture — DayFlow

## Role

DayFlow owns daily plans, reminders, execution results, reviews and memory.

## Phase 3 contract

~~~text
Firebase Auth
     │
     ▼
Firestore
     │
 ┌───┴─────────────────────────────┐
 │ users/{uid}/dayflow/...         │
 └─────────────────────────────────┘
~~~

Target collections:

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

## References

DayFlow stores lightweight references:

~~~text
taskId
occurrenceId
~~~

The source application remains authoritative.

## Local recovery

A future migration must preserve local state until cloud writes and reads have been verified.

## Transitional To-Do integration

The current browser bridge is a compatibility transport, not the final architecture. It may be replaced by authenticated shared references without changing DayFlow's domain ownership.

## External adapters

Google Calendar and email remain outside the DayFlow domain. Provider IDs and sync metadata should be stored as references when implemented.

## Next phase

- persist DayFlow domain records in Firestore
- connect Timetable occurrence references
- replace browser bridge
- add recovery/export
- add cross-app integrity tests
