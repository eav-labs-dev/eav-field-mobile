# Changelog

## Unreleased

- Initialized the Expo SDK 57 TypeScript application.
- Added demo authentication, dashboard, inspection, sync, and settings screens.
- Added shared design tokens, mock inspection data, unit coverage, and CI configuration.
- Added a committed npm lockfile and switched CI and setup guidance to reproducible `npm ci` installs.
- Added the versioned SQLite draft schema, database provider, repository, and unit coverage.
- Added inspection details, a two-section form, completion progress, and debounced offline autosave.
- Added camera and photo-library attachments with permission handling, draft recovery, previews, removal, and unit coverage.
- Added a persisted upload queue, guarded synchronization transitions, visible failure metadata, and manual retry behavior.
- Added a centralized API client, documented response contract, TanStack Query mutation, and sequential JSON inspection upload processing.
- Added API-backed sign-in, secure native session restoration, protected application routes, sign-out cleanup, and bearer authentication for API requests.
- Added durable photo storage, authenticated multipart transfer, idempotent attachment keys, and server attachment references in inspection submissions.
- Added startup recovery that returns interrupted in-flight uploads to the pending queue with retained retry metadata.

## 0.1.0 - Portfolio Rebuild Started

- Reset repository for EAV Labs portfolio rebuild.
- Added initial README and documentation structure.
