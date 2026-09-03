# EAV Field Mobile

Expo React Native application for field inspections, offline reporting, and reliable backend sync.

## Project status

EAV Field's MVP is implemented on `dev` and is being prepared for its release review. It includes API-backed sign-in, secure native session storage, cached assignments, an offline inspection form, durable photo evidence, a manual upload queue, and CI coverage.

## Problem

Field teams often work where connectivity is unreliable. Inspection records must remain usable without a network connection, save safely on the device, and synchronize without losing work when connectivity returns.

## Current features

- Expo Router navigation
- API-backed field-officer sign-in and restored native sessions
- SecureStore token persistence, protected routes, and authenticated API headers
- Assignment dashboard and workload summary
- Searchable inspection list
- Authenticated assignment downloads with an atomic SQLite offline cache
- Offline-draft and synchronization status interface
- Versioned SQLite schema and bound-parameter draft repository
- Inspection detail route with a two-section offline form
- Debounced draft autosave, recovery, and completion progress
- Camera and photo-library attachments copied into durable device storage
- Explicit upload queue with guarded transitions, failure metadata, and manual retry
- Startup recovery for uploads interrupted while in progress
- Centralized API client with authenticated JSON and multipart photo uploads
- Profile and device settings summary
- Shared TypeScript domain models and design tokens
- Unit test for inspection summaries
- GitHub Actions type-check and test workflow
- Validated Expo configuration and EAS preview/production build profiles

## Release evidence still required

- Android and iOS device screenshots
- A recorded run of the documented demo walkthrough
- Physical-device verification against the intended API environment

## Stack

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- Expo SQLite
- Expo ImagePicker
- Expo FileSystem
- Expo SecureStore
- TanStack Query
- Zustand
- Jest with `jest-expo`
- GitHub Actions

## Local setup

### Requirements

- Node.js 20.19.4 or newer
- npm
- Expo Go or an Android/iOS simulator compatible with Expo SDK 57

### Install and start

```bash
git clone https://github.com/eav-labs-dev/eav-field-mobile.git
cd eav-field-mobile
git checkout dev
npm ci
cp .env.example .env
npm start
```

Use the Expo terminal options to open Android, iOS, or web.

## Checks

```bash
npm run typecheck
npm run test
npm run check
npm run config:check
npm run docs:check
```

## Environment

| Variable | Purpose | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL used for authentication, assignments, and synchronization | `http://localhost:8000` |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | Maximum API request duration in milliseconds | `15000` |
| `EXPO_PUBLIC_DEMO_MODE` | Enables fictional portfolio assignments only when explicitly `true` | `false` |

Do not place secrets in `EXPO_PUBLIC_*` variables. Expo exposes those values to the application bundle.

Demo mode never bypasses authentication or replaces the configured API. Set `EXPO_PUBLIC_DEMO_MODE=true` only for a labelled portfolio demonstration; when it is false, dashboard, detail, and sync screens use cached API assignments only.

## Screenshots and demo

The repository does not include fabricated device captures. Follow the [reviewer demo walkthrough](docs/demo.md) to create sanitized Android and iOS evidence under `docs/screenshots/` before the release PR.

## Known limitations

- Synchronization is user-initiated; the MVP does not run a background connectivity worker.
- The API contract does not yet expose a conflict response and the client does not attempt automatic conflict resolution.
- Remote EAS builds require a maintainer to link the intended Expo project and provide signing credentials.
- Store submission, production usage, and physical-device verification are not claimed by this repository.

## Structure

```text
app/                         Expo Router screens and layouts
src/features/                Feature-scoped state, domain models, and UI
src/shared/components/       Reusable interface components
src/shared/theme/            Shared design tokens
docs/                        Architecture, roadmap, and project notes
```

## Documentation

- [Project brief](docs/project-brief.md)
- [Architecture](docs/architecture.md)
- [API synchronization contract](docs/api-sync.md)
- [Authentication contract](docs/authentication.md)
- [Release and demo builds](docs/release.md)
- [Reviewer demo walkthrough](docs/demo.md)
- [Roadmap](docs/roadmap.md)

## What this project demonstrates

EAV Field shows mobile product design, TypeScript application structure, field-operation workflows, offline-first planning, testable domain logic, and documentation discipline.

## License

See [LICENSE](LICENSE).
