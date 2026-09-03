# EAV Field demo walkthrough

This walkthrough gives reviewers a repeatable way to evaluate the offline inspection workflow without presenting the portfolio build as a production deployment.

## Preparation

1. Follow the local setup in the README and copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_DEMO_MODE=true` in `.env` to use the deterministic portfolio assignments. The checked-in example defaults to `false` so fictional data cannot appear accidentally.
3. Start the app with `npm start` and open an Android emulator or iOS simulator.
4. Choose “Explore offline demo”. Alternatively, use a non-production API account when a compatible Field backend is available.

Before recording evidence, run:

```bash
npm ci
npm run check
npm run config:check
npm run docs:check
```

## Primary walkthrough

1. Show that protected routes are unavailable before authentication, then enter the explicitly labelled offline demo.
2. Open the inspections list, search by site or reference, and select an assignment.
3. Complete the contact and condition sections, then leave and reopen the assignment to demonstrate offline autosave.
4. Attach one camera image and one library image. Explain that EAV Field copies both into app-owned storage.
5. Complete the form, queue it for upload, and open the Sync centre.
6. Run synchronization and show the final status. The upload sends photo binaries first and never includes device-local URIs in JSON.
7. Sign out and confirm that the secure native session is cleared.

## Offline recovery

1. Queue a complete inspection while the API is unavailable.
2. Run synchronization and show the retained failure message and retry count.
3. Choose retry after restoring the API and confirm that another queued inspection is not blocked by the earlier failure.
4. For interrupted-upload evidence, stop the app while an item is in progress, reopen it, and show that startup recovery returns it to the pending queue.

## Evidence checklist

- [ ] Android dashboard and workload summary
- [ ] Android inspection form with saved-offline state
- [ ] Android photo attachment preview
- [ ] Android Sync centre with retry state
- [ ] iOS equivalents or a clearly labelled platform limitation
- [ ] Short screen recording of the primary walkthrough
- [ ] CI link showing clean install, type-check, configuration validation, tests, and documentation validation

Store approved images under `docs/screenshots/android` and `docs/screenshots/ios`. Do not commit real credentials, customer information, faces, location metadata, or production inspection evidence.

## Honest demo boundaries

- Preview builds are internal portfolio artifacts, not app-store releases.
- Demo assignments and outcomes are fictional.
- Remote build signing and store submission remain maintainer-controlled.
- A successful scripted walkthrough is not a substitute for physical-device testing.
