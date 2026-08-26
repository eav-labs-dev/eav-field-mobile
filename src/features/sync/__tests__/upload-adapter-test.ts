import type { InspectionDraft } from '@/src/features/inspections/draft-repository';
import type { ApiClient } from '@/src/shared/api/api-client';
import { createInspectionUploadAdapter, serializeInspectionDraft } from '../upload-adapter';

const draft: InspectionDraft = {
  inspectionId: 'inspection/003',
  answers: {
    contactName: 'Ama',
    safetyBriefingCompleted: true,
    siteCondition: 'good',
    notes: 'Complete',
    photos: [
      {
        id: 'photo-1',
        uri: 'file:///private/device/photo.jpg',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        width: 1200,
        height: 900,
        source: 'camera',
        addedAt: '2026-08-26T08:00:00.000Z',
      },
    ],
  },
  progress: 100,
  syncStatus: 'pending',
  retryCount: 0,
  lastError: null,
  createdAt: '2026-08-26T07:30:00.000Z',
  updatedAt: '2026-08-26T08:00:00.000Z',
};

describe('inspection upload adapter', () => {
  test('removes device-only photo URIs from the remote payload', () => {
    const payload = serializeInspectionDraft(draft);

    expect(payload.answers.photos[0]).not.toHaveProperty('uri');
    expect(JSON.stringify(payload)).not.toContain('file:///private/device');
  });

  test('posts the serialized draft to the encoded inspection endpoint', async () => {
    const request = jest.fn().mockResolvedValue({
      submissionId: 'submission-1',
      receivedAt: '2026-08-26T08:01:00.000Z',
    });
    const adapter = createInspectionUploadAdapter({ request } as ApiClient);

    await adapter.upload(draft);

    expect(request).toHaveBeenCalledWith('/api/v1/inspections/inspection%2F003/submissions', {
      method: 'POST',
      body: JSON.stringify(serializeInspectionDraft(draft)),
    });
  });
});
