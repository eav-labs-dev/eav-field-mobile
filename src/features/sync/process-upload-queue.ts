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
  const summary: UploadQueueSummary = { attempted: 0, synced: 0, failed: 0 };

  for (const draft of drafts) {
    const claimed = await repository.markSyncing(draft.inspectionId, now());
    if (!claimed) continue;

    summary.attempted += 1;
    try {
      await adapter.upload(draft);
      await repository.markSynced(draft.inspectionId, now());
      summary.synced += 1;
    } catch (error) {
      await repository.markFailed(draft.inspectionId, errorMessage(error), now());
      summary.failed += 1;
    }
  }

  return summary;
};
