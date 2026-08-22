/**
 * @fileoverview Versioned SQLite migrations for offline field data.
 * @remarks Migrations only contain static SQL; user-provided values must use bound parameters.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

export const INITIAL_SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inspection_drafts (
  inspection_id TEXT PRIMARY KEY NOT NULL,
  answers_json TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK (progress BETWEEN 0 AND 100),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('draft', 'pending', 'syncing', 'failed', 'synced')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS inspection_drafts_sync_status_idx
  ON inspection_drafts (sync_status, updated_at);
`;

/**
 * Applies pending local database migrations in version order.
 * @param database Open Expo SQLite database connection.
 */
export const migrateDatabase = async (database: SQLiteDatabase): Promise<void> => {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `EAV Field database version ${currentVersion} is newer than supported version ${DATABASE_VERSION}.`,
    );
  }

  if (currentVersion === 0) {
    await database.execAsync(INITIAL_SCHEMA_SQL);
    await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
};
