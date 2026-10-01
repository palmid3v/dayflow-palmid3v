# Access Control

PALMI-D3V uses shared Firebase Authentication plus a Firestore access registry.

~~~text
Firebase Auth
     │
     ├── platformAdmins/{uid}
     │        └── admin bypass for all PALMI-D3V apps
     │
     └── appAccess/{uid}
              ├── timetable
              ├── todo
              └── dayflow
~~~

## Lifecycle

1. Account is created in Firebase Authentication.
2. Email is verified.
3. The first verified app session creates appAccess/{uid} if needed.
4. Initial application flags are all false.
5. The platform administrator sees the account in Access Manager.
6. The administrator enables the required application flags.
7. Firestore Rules enforce the resulting permissions.

## Administrator

The existence of platformAdmins/{uid} is the authoritative administrator check.

Admin status is not granted by the appAccess role field or by client-side UI state.

## Account discovery

The browser admin panel reads the PALMI-D3V appAccess registry. It does not enumerate Firebase Authentication users directly.

A newly registered account therefore appears in Access Manager after its verified session creates appAccess/{uid}.

## Security

Normal application access requires a verified Firebase user plus the corresponding appAccess flag.

Administrators bypass individual app flags.

User data remains scoped to users/{uid}/... and unmatched Firestore paths are denied.
