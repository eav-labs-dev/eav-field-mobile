/**
 * @fileoverview Sequential manual processor for pending inspection uploads.
 * @remarks One failed item does not prevent later queued drafts from being attempted.
 */

import type { InspectionDraft } from '@/src/features/inspections/draft-repository';
import type { InspectionUploadAdapter } from './upload-adapter';

export type UploadQueueRepository = {
  listPending: () => Promise<InspectionDraft[]>;
  markSyncing: (inspectionId: string, updatedAt: string) => Promise<boolean>;
  markSynced: (inspectionId: string, updatedAt: string) => Promise<boolean>;
  markFailed: (inspectionId: string, error: string, updatedAt: string) => Promise<boolean>;
};

export type UploadQueueSummary = {
  attempted: number;
  synced: number;
  failed: number;
  unresolved: number;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'The upload failed unexpectedly.';

/**
 * Processes pending drafts in local update order.
 * @param repository Persisted queue transition boundary.
 * @param adapter Remote inspection submission adapter.
 * @param now Injectable clock for deterministic verification.
 */
export const processUploadQueue = async (
  repository: UploadQueueRepository,
  adapter: InspectionUploadAdapter,
  now: () => string = () => new Date().toISOString(),
): Promise<UploadQueueSummary> => {
  const drafts = (await repository.listPending()).filter((draft) => draft.syncStatus === 'pending');
  const summary: UploadQueueSummary = { attempted: 0, synced: 0, failed: 0, unresolved: 0 };

  for (const draft of drafts) {
    let claimed = false;
    try {
      claimed = await repository.markSyncing(draft.inspectionId, now());
    } catch {
      summary.unresolved += 1;
      continue;
    }
    if (!claimed) continue;

    summary.attempted += 1;
    let remoteAccepted = false;
    try {
      await adapter.upload(draft);
      remoteAccepted = true;
      const persisted = await repository.markSynced(draft.inspectionId, now());
      if (persisted) summary.synced += 1;
      else summary.unresolved += 1;
    } catch (error) {
      if (remoteAccepted) {
        summary.unresolved += 1;
        continue;
      }

      try {
        const persisted = await repository.markFailed(
          draft.inspectionId,
          errorMessage(error),
          now(),
        );
        if (persisted) summary.failed += 1;
        else summary.unresolved += 1;
      } catch {
        summary.unresolved += 1;
      }
    }
  }

  return summary;
};
