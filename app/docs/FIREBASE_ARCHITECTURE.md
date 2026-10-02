# Firebase Architecture — DayFlow

## Role

DayFlow owns daily plans, reminders, execution results, reviews and memory.

## Shared persistence

PALMI-D3V uses one Firebase Authentication identity and one Firestore project across To-Do, TimeTable and DayFlow.

~~~text
Firebase Auth
     │
     ▼
Firestore
     │
users/{uid}/dayflow/...
~~~

## DayFlow cloud ownership

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/current
~~~

### What each record stores

**plans/{dateKey}**

- daily date
- ordered blocks
- block id
- time
- title
- emoji
- metadata/context
- execution state
- updatedAt

**results/{dateKey}**

- daily date
- recordedAt
- total block count
- completed/skipped/changed/planned counts
- block outcome snapshot

**memories/{dateKey}**

- daily date
- generatedAt
- human-readable summary
- user note
- block outcome snapshot

**reminders/current**

- current reminder list
- reminder id
- title
- time
- date
- completion state
- updatedAt

Appearance settings remain local because they are presentation preferences rather than productivity domain records.

## Local recovery

DayFlow keeps:

~~~text
localStorage["DAYFLOW"]
~~~

On an authenticated app session, DayFlow:

1. reads the local state;
2. reads the cloud domain records;
3. merges dated records using available timestamps;
4. uploads local records missing from the cloud;
5. persists the merged state locally;
6. only then enables the primary UI.

A cloud failure does not delete the local state. The app continues in local recovery mode and displays a cloud-sync warning.

## References

DayFlow stores lightweight references:

~~~text
taskId
occurrenceId
~~~

The source application remains authoritative.

## Transitional To-Do integration

The current browser bridge is a compatibility transport. DayFlow reads To-Do task snapshots but does not own or mutate To-Do task records.

## Weekly summary

A server-side Firebase scheduled function reads DayFlow cloud records for the previous Monday–Sunday period and can summarize:

- planned days
- reviewed days
- completed/skipped/changed/planned blocks
- open reminders
- recent daily review summaries

The email transport is handled by the shared PALMI-D3V backend through Resend.

## Security boundary

Firestore Security Rules enforce the client-side ownership boundary:

~~~text
users/{uid}/dayflow/...
~~~

Only the authenticated owner with DayFlow access can read/write the records. Server-side weekly summaries use Firebase Admin SDK from the trusted functions runtime rather than exposing privileged credentials to the browser.

## Next phase

- connect Timetable occurrence references
- replace the transitional To-Do browser bridge
- add authenticated cross-app integrity tests
- add recovery/export tooling
