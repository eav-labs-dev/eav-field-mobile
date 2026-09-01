/**
 * @fileoverview Multipart inspection photo adapter coverage.
 */

import type { PhotoAttachment } from '@/src/features/inspections/inspection-form';
import type { ApiClient } from '@/src/shared/api/api-client';
import { createPhotoUploadAdapter } from '../photo-upload-adapter';

const photo: PhotoAttachment = {
  id: 'photo-1',
  uri: 'file:///documents/inspection-photos/photo-1.jpg',
  fileName: 'photo-1.jpg',
  mimeType: 'image/jpeg',
  width: 1200,
  height: 900,
  source: 'camera',
  addedAt: '2026-08-28T08:00:00.000Z',
};

describe('photo upload adapter', () => {
  test('posts durable file metadata with a stable idempotency key', async () => {
    const request = jest.fn().mockResolvedValue({
      attachmentId: 'attachment-1',
      uploadedAt: '2026-08-28T08:01:00.000Z',
    });
    const adapter = createPhotoUploadAdapter({ request } as ApiClient);

    await adapter.upload('inspection/003', photo);

    expect(request).toHaveBeenCalledWith(
      '/api/v1/inspections/inspection%2F003/attachments',
      expect.objectContaining({
        body: expect.any(FormData),
        headers: { 'X-Idempotency-Key': 'photo-1' },
        method: 'POST',
      }),
    );
  });
});
