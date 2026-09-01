# Mobile release and demo builds

## Build profiles

EAV Field defines two EAS Build profiles:

- `preview` creates an internally distributed Android APK and an installable internal iOS build for reviewer testing.
- `production` creates store-oriented artifacts and increments the native build version.

Both profiles use Node.js 20.19.4, which matches the repository's Expo SDK requirement. EAS also refuses to start a build from uncommitted work.

## Preflight

Run the repository checks before requesting a remote build:

```bash
npm ci
npm run check
npm run config:check
```

The configuration check validates the committed application identifiers, native build versions, EAS profiles, and resolved Expo public configuration. It does not require EAS credentials.

## Preview build

After authenticating the EAS CLI and linking the repository to the intended EAV Labs Expo project:

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

The first signed build may prompt an authorized maintainer to create or select platform credentials. Do not commit signing certificates, provisioning profiles, keystores, access tokens, or Expo credentials.

## Production boundary

The production profile is configuration-ready, but a store release is not automatic. Before requesting one:

1. merge the approved Field PR sequence into `dev`;
2. verify the complete offline inspection and synchronization flow on physical devices;
3. capture reviewer screenshots and the demo walkthrough;
4. promote a tested release candidate from `dev` to `main`;
5. confirm store metadata, privacy disclosures, signing ownership, and the production API URL.

Production builds run with:

```bash
eas build --profile production --platform all
```

Submission to either store remains a separate, explicitly approved operation.
