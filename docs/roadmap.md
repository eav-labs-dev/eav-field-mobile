# EAV Field roadmap

## Foundation

- [x] Initialize Expo Router and TypeScript application structure.
- [x] Add demo sign-in, dashboard, inspections, sync, and settings screens.
- [x] Add shared design tokens and initial unit coverage.
- [x] Add GitHub Actions checks.
- [x] Lock dependency resolution and use reproducible CI installs.

## Offline inspection workflow

- [x] Add SQLite schema and migrations.
- [x] Add the bound-parameter inspection draft repository.
- [x] Add inspection detail route.
- [x] Build multi-section inspection form.
- [x] Save and recover drafts automatically.
- [x] Add camera and photo-library attachments to offline drafts.

## Completed MVP — synchronization

- [x] Add API-backed authentication and secure native session restoration.
- [x] Add centralized API client and normalized response errors.
- [x] Add the manual JSON inspection upload adapter.
- [x] Add durable local photo storage and binary upload adapters.
- [x] Add authenticated assignment downloads and an atomic offline cache.
- [x] Add explicit queue transitions, failure metadata, and manual retry.
- [x] Recover interrupted in-flight uploads during database initialization.

## Completed MVP — portfolio release foundation

- [ ] Capture Android and iOS screenshots.
- [x] Add a reviewer demo walkthrough and evidence checklist.
- [x] Validate Expo configuration and document EAS preview and production builds.
- [ ] Promote the tested MVP from `dev` to `main`.

## Post-MVP ideas

- Add an API-defined conflict response and dedicated conflict-resolution interface.
- Add connectivity-aware background synchronization.
- Add device-level end-to-end coverage for the primary inspection workflow.
- Reconcile server attachments orphaned by an interrupted multi-step upload.
