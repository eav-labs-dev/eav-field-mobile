# Inspection synchronization contract

## Configuration

- `EXPO_PUBLIC_API_URL` selects the backend origin.
- `EXPO_PUBLIC_API_TIMEOUT_MS` controls the request timeout and defaults to 15 seconds.
- Public Expo variables are configuration only and must never contain tokens or secrets.

## Upload endpoint

EAV Field submits queued JSON inspection data to:

```text
POST /api/v1/inspections/{inspectionId}/submissions
```

The request includes the inspection identifier, completion percentage, normalized answers, photo metadata, and client timestamps. Device-local photo URIs are removed before serialization because they are meaningless to the server and can expose local paths.

The adapter expects the standard EAV response envelope:

```json
{
  "success": true,
  "code": "INSPECTION_SUBMITTED",
  "message": "Inspection accepted.",
  "data": {
    "submissionId": "submission-123",
    "receivedAt": "2026-08-26T08:00:00Z"
  },
  "page": null,
  "sort": null,
  "filters": null,
  "error": null
}
```

## Failure behavior

- Network, timeout, non-2xx, and unsuccessful-envelope responses become safe API errors.
- A failed upload remains in SQLite with its last error and incremented retry count.
- Later queued drafts are still attempted when one upload fails.
- Failed items require an explicit retry before another upload attempt.
- Synced records remain as local audit snapshots.

## Deliberate boundaries

This milestone uploads inspection JSON only. Authentication headers, binary photo transfer, assignment downloads, background connectivity processing, and conflict resolution remain separate milestones.
