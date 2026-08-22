/**
 * @fileoverview Unit coverage for versioned SQLite schema initialization.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION, migrateDatabase } from '../migrations';

const createDatabase = (version: number) =>
  ({
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockResolvedValue({ user_version: version }),
  }) as unknown as SQLiteDatabase;

describe('migrateDatabase', () => {
  test('creates the initial draft schema and records its version', async () => {
    const database = createDatabase(0);

    await migrateDatabase(database);

    expect(database.execAsync).toHaveBeenCalledTimes(2);
    expect(database.execAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('CREATE TABLE IF NOT EXISTS inspection_drafts'),
    );
    expect(database.execAsync).toHaveBeenNthCalledWith(
      2,
      `PRAGMA user_version = ${DATABASE_VERSION}`,
    );
  });

  test('does not reapply a completed migration', async () => {
    const database = createDatabase(DATABASE_VERSION);

    await migrateDatabase(database);

    expect(database.execAsync).not.toHaveBeenCalled();
  });

  test('rejects a database created by a newer application version', async () => {
    const database = createDatabase(DATABASE_VERSION + 1);

    await expect(migrateDatabase(database)).rejects.toThrow('newer than supported');
  });
});
