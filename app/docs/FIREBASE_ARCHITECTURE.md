# Firebase Architecture — DayFlow

## Role in PALMI-D3V

DayFlow is the daily-orchestration and memory domain.

Firebase provides shared identity and persistence, while DayFlow owns only its own documents.

## Shared ecosystem

~~~text
                    Firebase Auth
                         │
                         ▼
                    user.uid
                         │
                  Cloud Firestore
            ┌────────────┼────────────┐
            ▼            ▼            ▼
          To-Do       Timetable     DayFlow
          tasks        schedule      plans
                       history       memory
~~~

## Ownership

- To-Do owns tasks.
- Timetable owns recurring schedules and occurrences.
- DayFlow owns daily plans, execution results, reminders and memory.

## DayFlow collections

Target user-scoped paths:

~~~text
users/{uid}/dayflow/plans/{dateKey}
users/{uid}/dayflow/results/{dateKey}
users/{uid}/dayflow/memories/{dateKey}
users/{uid}/dayflow/reminders/{id}
~~~

DayFlow may store references to To-Do task IDs and Timetable occurrence IDs. It must not copy their full authoritative records into a second database.

## Transitional browser bridge

The current To-Do postMessage bridge remains supported during migration.

Long-term, authenticated shared references should replace copied task snapshots where practical.

## Data durability

Existing local DayFlow data must remain available until cloud persistence is verified.

Migration order:

1. preserve local state
2. authenticate user
3. write cloud data
4. verify cloud reads
5. retain local recovery data
6. only then mark migration complete

## External adapters

Google Calendar and email should be integrated behind explicit adapters so DayFlow's domain remains independent from provider-specific APIs.

## Security

Firebase Web configuration is client configuration, not an Admin credential. Security Rules remain the ownership boundary.
