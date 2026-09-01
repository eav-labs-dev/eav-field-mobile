/**
 * @fileoverview Remote adapter for uploading completed inspection draft data.
 * @remarks Photo binaries are uploaded first and the final JSON references server attachment IDs.
 */

import type { InspectionDraft } from '@/src/features/inspections/draft-repository';
import { normalizeInspectionForm } from '@/src/features/inspections/inspection-form';
import type { ApiClient } from '@/src/shared/api/api-client';
import { createPhotoUploadAdapter, type PhotoUploadAdapter, type UploadedPhoto } from './photo-upload-adapter';

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
export const serializeInspectionDraft = (
  draft: InspectionDraft,
  uploadedPhotos: Map<string, UploadedPhoto> = new Map(),
) => {
  const answers = normalizeInspectionForm(draft.answers);
  return {
    inspectionId: draft.inspectionId,
    progress: draft.progress,
    answers: {
      ...answers,
      photos: answers.photos.map(({ uri: _localUri, ...photo }) => ({
        ...photo,
        attachmentId: uploadedPhotos.get(photo.id)?.attachmentId ?? null,
      })),
    },
    clientCreatedAt: draft.createdAt,
    clientUpdatedAt: draft.updatedAt,
  };
};

/** Creates the inspection submission adapter around the shared API client. */
export const createInspectionUploadAdapter = (
  client: ApiClient,
  photoAdapter: PhotoUploadAdapter = createPhotoUploadAdapter(client),
): InspectionUploadAdapter => ({
  upload: async (draft) => {
    const answers = normalizeInspectionForm(draft.answers);
    const uploadedPhotos = new Map<string, UploadedPhoto>();

    for (const photo of answers.photos) {
      uploadedPhotos.set(photo.id, await photoAdapter.upload(draft.inspectionId, photo));
    }

    return client.request<InspectionSubmissionResult>(
      `/api/v1/inspections/${encodeURIComponent(draft.inspectionId)}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify(serializeInspectionDraft(draft, uploadedPhotos)),
      },
    );
  },
});
