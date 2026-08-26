/**
 * @fileoverview Remote adapter for uploading completed inspection draft data.
 * @remarks Local photo URIs never leave the device; binary upload is a separate milestone.
 */

import type { InspectionDraft } from '@/src/features/inspections/draft-repository';
import { normalizeInspectionForm } from '@/src/features/inspections/inspection-form';
import type { ApiClient } from '@/src/shared/api/api-client';

export type InspectionSubmissionResult = {
  submissionId: string;
  receivedAt: string;
};

export type InspectionUploadAdapter = {
  upload: (draft: InspectionDraft) => Promise<InspectionSubmissionResult>;
};

/**
 * Builds the JSON payload while removing device-only photo URIs.
 * @param draft Persisted local draft.
 */
export const serializeInspectionDraft = (draft: InspectionDraft) => {
  const answers = normalizeInspectionForm(draft.answers);
  return {
    inspectionId: draft.inspectionId,
    progress: draft.progress,
    answers: {
      ...answers,
      photos: answers.photos.map(({ uri: _localUri, ...photo }) => photo),
    },
    clientCreatedAt: draft.createdAt,
    clientUpdatedAt: draft.updatedAt,
  };
};

/** Creates the inspection submission adapter around the shared API client. */
export const createInspectionUploadAdapter = (client: ApiClient): InspectionUploadAdapter => ({
  upload: (draft) =>
    client.request<InspectionSubmissionResult>(
      `/api/v1/inspections/${encodeURIComponent(draft.inspectionId)}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify(serializeInspectionDraft(draft)),
      },
    ),
});
