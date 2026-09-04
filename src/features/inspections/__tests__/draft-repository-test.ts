/**
 * @fileoverview Unit coverage for SQLite-backed inspection draft persistence.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { createDraftRepository, type InspectionDraft } from '../draft-repository';

const draft: InspectionDraft = {
  inspectionId: 'inspection-003',
  answers: { meterReading: 42, notes: 'Valve inspected' },
  progress: 35,
  syncStatus: 'draft',
  retryCount: 0,
  lastError: null,
  createdAt: '2026-08-22T08:00:00.000Z',
  updatedAt: '2026-08-22T08:15:00.000Z',
};

const createDatabase = () =>
  ({
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
  }) as unknown as SQLiteDatabase;

describe('createDraftRepository', () => {
  test('saves answers with bound values', async () => {
    const database = createDatabase();
    const repository = createDraftRepository(database);

    await repository.save(draft);

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT(inspection_id) DO UPDATE'),
      draft.inspectionId,
      JSON.stringify(draft.answers),
      draft.progress,
      draft.syncStatus,
      draft.retryCount,
      draft.lastError,
      draft.createdAt,
      draft.updatedAt,
    );
  });

  test('maps a stored row back to the domain model', async () => {
    const database = createDatabase();
    jest.mocked(database.getFirstAsync).mockResolvedValue({
      inspection_id: draft.inspectionId,
      answers_json: JSON.stringify(draft.answers),
      progress: draft.progress,
      sync_status: draft.syncStatus,
      retry_count: draft.retryCount,
      last_error: draft.lastError,
      created_at: draft.createdAt,
      updated_at: draft.updatedAt,
    });
    const repository = createDraftRepository(database);

    await expect(repository.findByInspectionId(draft.inspectionId)).resolves.toEqual(draft);
  });

  test('rejects invalid progress before writing', async () => {
    const database = createDatabase();
    const repository = createDraftRepository(database);

    await expect(repository.save({ ...draft, progress: 101 })).rejects.toThrow(RangeError);
    expect(database.runAsync).not.toHaveBeenCalled();
  });

  test('queues only a local draft and clears stale retry metadata', async () => {
    const database = createDatabase();
    const repository = createDraftRepository(database);

    await expect(
      repository.queueForUpload(draft.inspectionId, '2026-08-25T08:00:00.000Z'),
    ).resolves.toBe(true);
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("sync_status = 'pending'"),
      '2026-08-25T08:00:00.000Z',
      draft.inspectionId,
    );
  });

  test('records failures and keeps retry transitions explicit', async () => {
    const database = createDatabase();
    const repository = createDraftRepository(database);

    await repository.markFailed(
      draft.inspectionId,
      'Network request timed out.',
      '2026-08-25T08:05:00.000Z',
    );
    await repository.retry(draft.inspectionId, '2026-08-25T08:06:00.000Z');

    expect(database.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('retry_count = retry_count + 1'),
      'Network request timed out.',
      '2026-08-25T08:05:00.000Z',
      draft.inspectionId,
    );
    expect(database.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("sync_status = 'pending'"),
      '2026-08-25T08:06:00.000Z',
      draft.inspectionId,
    );
  });
});
