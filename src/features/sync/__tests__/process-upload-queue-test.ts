import type { InspectionDraft } from '@/src/features/inspections/draft-repository';
import { processUploadQueue, type UploadQueueRepository } from '../process-upload-queue';
import type { InspectionUploadAdapter } from '../upload-adapter';

const draft = (inspectionId: string): InspectionDraft => ({
  inspectionId,
  answers: {},
  progress: 100,
  syncStatus: 'pending',
  retryCount: 0,
  lastError: null,
  createdAt: '2026-08-26T07:00:00.000Z',
  updatedAt: '2026-08-26T08:00:00.000Z',
});

describe('processUploadQueue', () => {
  test('continues after a failed item and records each final state', async () => {
    const drafts = [draft('inspection-1'), draft('inspection-2')];
    const repository = {
      listPending: jest.fn().mockResolvedValue(drafts),
      markSyncing: jest.fn().mockResolvedValue(true),
      markSynced: jest.fn().mockResolvedValue(true),
      markFailed: jest.fn().mockResolvedValue(true),
    } satisfies UploadQueueRepository;
    const adapter = {
      upload: jest
        .fn()
        .mockResolvedValueOnce({ submissionId: 'sub-1', receivedAt: 'now' })
        .mockRejectedValueOnce(new Error('API unavailable')),
    } satisfies InspectionUploadAdapter;

    await expect(
      processUploadQueue(repository, adapter, () => '2026-08-26T08:10:00.000Z'),
    ).resolves.toEqual({ attempted: 2, synced: 1, failed: 1 });
    expect(repository.markSynced).toHaveBeenCalledWith(
      'inspection-1',
      '2026-08-26T08:10:00.000Z',
    );
    expect(repository.markFailed).toHaveBeenCalledWith(
      'inspection-2',
      'API unavailable',
      '2026-08-26T08:10:00.000Z',
    );
  });

  test('ignores failed records until the user explicitly retries them', async () => {
    const failedDraft = { ...draft('inspection-failed'), syncStatus: 'failed' as const };
    const repository = {
      listPending: jest.fn().mockResolvedValue([failedDraft]),
      markSyncing: jest.fn().mockResolvedValue(true),
      markSynced: jest.fn().mockResolvedValue(true),
      markFailed: jest.fn().mockResolvedValue(true),
    } satisfies UploadQueueRepository;
    const adapter = { upload: jest.fn() } satisfies InspectionUploadAdapter;

    await expect(processUploadQueue(repository, adapter)).resolves.toEqual({
      attempted: 0,
      synced: 0,
      failed: 0,
    });
    expect(adapter.upload).not.toHaveBeenCalled();
  });
});
