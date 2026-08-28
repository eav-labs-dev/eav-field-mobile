# EAV Field Mobile

Expo React Native application for field inspections, offline reporting, and reliable backend sync.

## Project status

EAV Field is under active development as part of the EAV Labs portfolio. The current foundation includes API-backed sign-in, secure native session storage, the main navigation, field officer dashboard, assignment list, sync centre, settings screen, shared design tokens, mock domain data, and CI coverage.

Durable photo transfer and conflict reporting are the next implementation milestones.

## Problem

Field teams often work where connectivity is unreliable. Inspection records must remain usable without a network connection, save safely on the device, and synchronize without losing work when connectivity returns.

## Current features

- Expo Router navigation
- API-backed field-officer sign-in and restored native sessions
- SecureStore token persistence, protected routes, and authenticated API headers
- Assignment dashboard and workload summary
- Searchable inspection list
- Offline-draft and synchronization status interface
- Versioned SQLite schema and bound-parameter draft repository
- Inspection detail route with a two-section offline form
- Debounced draft autosave, recovery, and completion progress
- Camera and photo-library attachments stored with offline drafts
- Explicit upload queue with guarded transitions, failure metadata, and manual retry
- Startup recovery for uploads interrupted while in progress
- Centralized API client and manual JSON inspection upload adapter
- Profile and device settings summary
- Shared TypeScript domain models and design tokens
- Unit test for inspection summaries
- GitHub Actions type-check and test workflow

## Remaining MVP

- Durable photo upload and conflict handling
- Device screenshots and demo walkthrough

## Stack

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- Expo SQLite
- Expo ImagePicker
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
```

## Environment

| Variable | Purpose | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL used by the future sync client | `http://localhost:8000` |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | Maximum API request duration in milliseconds | `15000` |
| `EXPO_PUBLIC_DEMO_MODE` | Enables portfolio demo data | `true` |

Do not place secrets in `EXPO_PUBLIC_*` variables. Expo exposes those values to the application bundle.

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
- [Roadmap](docs/roadmap.md)

## What this project demonstrates

EAV Field shows mobile product design, TypeScript application structure, field-operation workflows, offline-first planning, testable domain logic, and documentation discipline.

## License

See [LICENSE](LICENSE).
