/** @fileoverview Assignment cache and download coordination coverage. */

import type { SQLiteDatabase } from 'expo-sqlite';

import { createAssignmentRepository } from '../assignment-repository';
import { refreshAssignments } from '../refresh-assignments';
import type { Inspection } from '../types';

const assignment: Inspection = {
  id: 'inspection-101',
  reference: 'INS-3101',
  siteName: 'Adenta Pump Station',
  location: 'Adenta, Greater Accra',
  dueLabel: 'Due Friday',
  status: 'assigned',
  progress: 0,
};

const createDatabase = () =>
  ({
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
    withTransactionAsync: jest.fn(async (operation: () => Promise<void>) => operation()),
  }) as unknown as SQLiteDatabase;

describe('assignment cache', () => {
  test('replaces cached assignments inside one transaction with bound values', async () => {
    const database = createDatabase();
    const repository = createAssignmentRepository(database);

    await repository.replaceAll([assignment], '2026-09-02T09:00:00.000Z');

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenNthCalledWith(1, 'DELETE FROM inspection_assignments');
    expect(database.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO inspection_assignments'),
      assignment.id,
      assignment.reference,
      assignment.siteName,
      assignment.location,
      assignment.dueLabel,
      assignment.status,
      assignment.progress,
      '2026-09-02T09:00:00.000Z',
    );
  });

  test('retains the old cache when a download fails', async () => {
    const database = createDatabase();
    const repository = createAssignmentRepository(database);
    const adapter = { download: jest.fn().mockRejectedValue(new Error('offline')) };

    await expect(refreshAssignments(repository, adapter)).rejects.toThrow('offline');
    expect(database.withTransactionAsync).not.toHaveBeenCalled();
  });

  test('downloads, persists, and returns the same assignment snapshot', async () => {
    const database = createDatabase();
    const repository = createAssignmentRepository(database);
    const adapter = { download: jest.fn().mockResolvedValue([assignment]) };

    await expect(
      refreshAssignments(repository, adapter, () => '2026-09-02T09:00:00.000Z'),
    ).resolves.toEqual([assignment]);
    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
  });
});
