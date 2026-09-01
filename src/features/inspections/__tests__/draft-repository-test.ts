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
});
