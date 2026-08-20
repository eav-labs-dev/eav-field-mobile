# EAV Field architecture

## Overview

EAV Field uses an offline-first mobile architecture. The local database is the source of truth for work in progress. Network synchronization operates as a separate process so a failed request cannot erase or block a field officer's draft.

## Application layers

```text
Expo Router screens
        |
Feature components and Zustand client state
        |
TanStack Query server-state adapters
        |
Inspection and sync repositories
        |
Expo SQLite                 Remote API
```

## Route groups

- `app/(auth)` contains authentication screens.
- `app/(tabs)` contains the main field-operation navigation.
- Future `app/inspections` routes will contain assignment detail and form workflows.

## Feature boundaries

- `src/features/auth` owns local session state and future authentication adapters.
- `src/features/inspections` owns inspection types, lists, forms, validation, and persistence.
- A future `src/features/sync` module will own the upload queue, retries, and conflict reporting.
- `src/shared` contains components and tokens that have no feature-specific business rules.

## Offline data flow

1. An assigned inspection is downloaded and stored locally.
2. Form changes are written to a local draft before any upload is attempted.
3. The draft receives a synchronization state such as `pending`, `syncing`, `synced`, or `failed`.
4. The sync worker uploads queued changes when a connection is available.
5. Successful responses update the local record with its remote identifier and server timestamp.
6. Conflicts remain visible to the user and are never resolved by silently discarding local work.

## Security boundaries

- Public Expo environment variables contain configuration only, never secrets.
- Authentication tokens will use platform-secure storage rather than SQLite.
- SQL statements use bound parameters.
- Photos remain local until an authenticated upload succeeds.

## Testing approach

- Unit tests cover domain transformations and synchronization decisions.
- Component tests cover forms, status messages, and user actions.
- Integration tests cover SQLite repositories and queue transitions.
- A later Maestro flow will cover the primary offline inspection journey.
