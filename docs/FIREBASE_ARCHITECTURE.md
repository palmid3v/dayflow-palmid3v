# Firebase Architecture — DayFlow

## Purpose

DayFlow is being prepared for public deployment on Vercel while keeping personal productivity data private and user-scoped.

Firebase will provide the shared identity and persistence layer for the PALMI-D3V productivity ecosystem.

## Target architecture

~~~text
Firebase Authentication
        │
        └── user.uid
              │
       ┌──────┴──────┐
       │             │
    DayFlow        To-Do
       │             │
       └──────┬──────┘
              │
          Firestore
~~~

### Responsibilities

- Firebase Authentication identifies the signed-in PALMI-D3V user.
- Firestore stores user-scoped application data.
- DayFlow owns calendar blocks, reminders, daily plans, results, and memory.
- To-Do owns task creation, task state, completion, lifecycle, and task persistence.
- DayFlow may read To-Do tasks but must not create a second task collection or mutate To-Do tasks.

## Current implementation

Firebase Authentication is now integrated at the application boundary using the modular Firebase Web SDK. The app requires authentication before rendering personal data, and Auth state is observed through Firebase's auth observer. Firestore persistence is intentionally not enabled yet.

## Current transition state

The application still uses local-first persistence and the existing read-only browser bridge for To-Do.

The bridge is retained temporarily so current development continues to work while Firebase is configured.

It is **not** the intended final production data architecture.

## Planned Firestore ownership

Conceptually:

~~~text
users/{uid}/tasks/{taskId}                 → To-Do-owned
users/{uid}/dayflow/plans/{dateKey}       → DayFlow-owned
users/{uid}/dayflow/results/{dateKey}     → DayFlow-owned
users/{uid}/dayflow/memories/{dateKey}    → DayFlow-owned
users/{uid}/dayflow/reminders/{id}        → DayFlow-owned
~~~

The exact schema and Security Rules will be finalized after the Firebase project and production domains are available.

## Security requirements

1. Authentication is required before personal data is shown. **Implemented.**
2. Firestore reads/writes must be restricted to the authenticated user's UID.
3. Client applications must never contain Firebase Admin credentials.
4. Vercel environment variables will contain only public Firebase Web SDK configuration.
5. Security Rules, not client-side checks, enforce ownership.

## Migration strategy

1. Keep the existing local DAYFLOW data available during development.
2. Configure Firebase Authentication.
3. Configure Firestore and Security Rules.
4. Introduce authenticated user-scoped persistence.
5. Migrate To-Do's existing TODO localStorage data once per user.
6. Move DayFlow persistence to Firestore.
7. Replace the cross-origin postMessage task bridge with shared Firestore reads where appropriate.
8. Retain a local/offline strategy only where it is explicitly designed and synchronized.

## Environment preparation

The application will eventually receive these Vite variables through Vercel:

~~~text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
~~~

Do not commit real environment values or Firebase Admin credentials.
