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

- `src/features/auth` owns the authentication adapter, session state, and secure persistence boundary.
- `src/features/inspections` owns inspection types, lists, forms, validation, and persistence.
- `src/features/sync` owns the upload queue state machine and retry rules. Future adapters will add transport and conflict reporting.
- `src/shared` contains components and tokens that have no feature-specific business rules.

## Local database

The root layout opens `eav-field.db` through Expo's `SQLiteProvider`. The provider runs ordered migrations before rendering application routes. SQLite `user_version` records the applied schema version.

The first migration creates `inspection_drafts`, which stores serialized answers, completion progress, synchronization state, retry metadata, errors, and timestamps. Repository writes use bound parameters. A synchronization index supports ordered lookup of drafts that still require processing.

The dynamic `app/inspections/[id]` route loads any existing draft after the database is ready. Field changes update local form state immediately and trigger a 600 ms debounced write. The UI reports loading, saving, saved, and error states without making network availability part of the save path.

Expo ImagePicker provides camera and photo-library selection. Picker assets are copied from temporary cache locations into the app document directory before the durable URI and validated metadata enter the draft. Picker failures and denied camera permission do not interrupt other offline edits. Removing a photo deletes the app-owned file.

During synchronization, photo files are uploaded first through authenticated multipart requests. Each upload uses its stable local photo ID as an idempotency key. The final inspection submission references the returned attachment IDs and never serializes a device-local URI.

The upload queue uses guarded `draft → pending → syncing → synced` transitions. A transport error moves only a `syncing` record to `failed`, increments its retry count, and retains the last error. A user retry returns `failed` to `pending`. Invalid or skipped transitions are rejected, and synced snapshots are retained locally instead of being deleted automatically.

Database initialization also recovers records left in `syncing` when the app process was interrupted. Those records return to `pending`, retain an interruption message, and increment their retry count before another explicit sync run can claim them. This prevents an operating-system stop or crash from leaving work permanently stranded.

The shared API client normalizes the configured base URL, JSON headers, request timeout, EAV response envelope, and safe error messages. The inspection upload adapter owns endpoint and payload mapping, while the queue processor owns local state transitions. The Sync centre invokes that processor through a TanStack Query mutation, processes pending drafts sequentially, and refreshes SQLite state when the run finishes. See [the synchronization contract](api-sync.md).

## Offline data flow

1. An assigned inspection is downloaded and stored locally.
2. Form changes are written to a local draft before any upload is attempted.
3. The draft receives a synchronization state such as `pending`, `syncing`, `synced`, or `failed`.
4. The sync worker uploads queued changes when a connection is available.
5. Successful responses update the local record with its remote identifier and server timestamp.
6. Conflicts remain visible to the user and are never resolved by silently discarding local work.

## Security boundaries

- Public Expo environment variables contain configuration only, never secrets.
- Authentication tokens use Expo SecureStore on native devices rather than SQLite. Web sessions remain memory-only.
- The API client reads the stored token for each protected request and sends it as a bearer token. The login request explicitly skips authentication.
- Passwords exist only in the sign-in form and login request body; they are never written to device storage.
- SQL statements use bound parameters.
- Photo URIs and metadata remain local until an authenticated upload succeeds. Picker cache files are not treated as durable server storage.

## Testing approach

- Unit tests cover domain transformations and synchronization decisions.
- Component tests cover forms, status messages, and user actions.
- Integration tests cover SQLite repositories and queue transitions.
- A later Maestro flow will cover the primary offline inspection journey.
