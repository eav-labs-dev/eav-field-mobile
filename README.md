# EAV Field Mobile

Expo React Native application for field inspections, offline reporting, and reliable backend sync.

## Project status

EAV Field is under active development as part of the EAV Labs portfolio. The current foundation includes the main navigation, demo sign-in, field officer dashboard, assignment list, sync centre, settings screen, shared design tokens, mock domain data, and initial CI coverage.

Draft autosave integration, inspection forms, photos, and API synchronization are the next implementation milestones.

## Problem

Field teams often work where connectivity is unreliable. Inspection records must remain usable without a network connection, save safely on the device, and synchronize without losing work when connectivity returns.

## Current features

- Expo Router navigation
- Demo field-officer sign-in
- Assignment dashboard and workload summary
- Searchable inspection list
- Offline-draft and synchronization status interface
- Versioned SQLite schema and bound-parameter draft repository
- Profile and device settings summary
- Shared TypeScript domain models and design tokens
- Unit test for inspection summaries
- GitHub Actions type-check and test workflow

## Planned MVP

- Inspection detail and multi-section form
- SQLite-backed offline drafts
- Draft autosave and recovery
- Photo attachment placeholder
- Explicit upload queue and retry states
- API client and TanStack Query integration
- Authentication integration
- Device screenshots and demo walkthrough

## Stack

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- Expo SQLite
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
- [Roadmap](docs/roadmap.md)

## What this project demonstrates

EAV Field shows mobile product design, TypeScript application structure, field-operation workflows, offline-first planning, testable domain logic, and documentation discipline.

## License

See [LICENSE](LICENSE).
