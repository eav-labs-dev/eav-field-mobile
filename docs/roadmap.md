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

## Synchronization

- [ ] Add centralized API client.
- [ ] Add download and upload adapters.
- [x] Add explicit queue transitions, failure metadata, and manual retry.
- [ ] Add conflict reporting.
- [ ] Add connectivity-aware background synchronization.

## Portfolio release

- [ ] Add component and persistence integration tests.
- [ ] Capture Android and iOS screenshots.
- [ ] Add demo walkthrough.
- [ ] Document deployment and EAS build configuration.
- [ ] Promote the tested MVP from `dev` to `main`.
