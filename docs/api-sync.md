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

Before the final JSON request, each photo is uploaded as multipart form data to `POST /api/v1/inspections/{inspectionId}/attachments`. The stable local photo ID is also sent as an idempotency key so a retry does not need to create a duplicate attachment. The final submission has its own stable idempotency key derived from the inspection and local update timestamp, contains server attachment IDs, and excludes device-local URIs.

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

## Assignment download

The signed-in field officer refreshes assignments from:

```text
GET /api/v1/inspections/assignments
```

The response `data` is an array of inspection summaries. EAV Field validates the required identifiers and progress range, then atomically replaces the local SQLite assignment cache. A network or validation failure preserves the previous offline snapshot.

## Failure behavior

- Network, timeout, non-2xx, and unsuccessful-envelope responses become safe API errors.
- A failed photo or submission upload remains in SQLite with its last error and incremented retry count.
- Later queued drafts are still attempted when one upload fails.
- Failed items require an explicit retry before another upload attempt.
- Synced records remain as local audit snapshots.
- A remote success is reported as synced only after SQLite accepts the final state transition. Local transition failures are counted as unresolved instead of being presented as successful uploads.

## Deliberate boundaries

Orphan-attachment reconciliation, background connectivity processing, and conflict resolution remain separate milestones.
