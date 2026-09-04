/**
 * @fileoverview Multipart transfer adapter for durable inspection photo evidence.
 */

import type { PhotoAttachment } from '@/src/features/inspections/inspection-form';
import type { ApiClient } from '@/src/shared/api/api-client';

export type UploadedPhoto = {
  attachmentId: string;
  uploadedAt: string;
};

export type PhotoUploadAdapter = {
  upload: (inspectionId: string, photo: PhotoAttachment) => Promise<UploadedPhoto>;
};

/** Creates an authenticated multipart photo adapter with an idempotency key. */
export const createPhotoUploadAdapter = (client: ApiClient): PhotoUploadAdapter => ({
  upload: (inspectionId, photo) => {
    const body = new FormData();
    body.append('photoId', photo.id);
    body.append(
      'file',
      {
        name: photo.fileName ?? `${photo.id}.jpg`,
        type: photo.mimeType ?? 'application/octet-stream',
        uri: photo.uri,
      } as unknown as Blob,
    );

    return client.request<UploadedPhoto>(
      `/api/v1/inspections/${encodeURIComponent(inspectionId)}/attachments`,
      {
        body,
        headers: { 'X-Idempotency-Key': photo.id },
        method: 'POST',
      },
    );
  },
});
