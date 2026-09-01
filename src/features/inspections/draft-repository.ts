/**
 * @fileoverview SQLite repository for inspection drafts created offline.
 * @remarks All draft values use bound parameters and answers are serialized as JSON.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import type { DraftSyncStatus } from '@/src/features/sync/queue-state';

export type { DraftSyncStatus } from '@/src/features/sync/queue-state';

export type InspectionDraft = {
  inspectionId: string;
  answers: Record<string, unknown>;
  progress: number;
  syncStatus: DraftSyncStatus;
  retryCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

type InspectionDraftRow = {
  inspection_id: string;
  answers_json: string;
  progress: number;
  sync_status: DraftSyncStatus;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

const mapDraftRow = (row: InspectionDraftRow): InspectionDraft => ({
  inspectionId: row.inspection_id,
  answers: JSON.parse(row.answers_json) as Record<string, unknown>,
  progress: row.progress,
  syncStatus: row.sync_status,
  retryCount: row.retry_count,
  lastError: row.last_error,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createDraftRepository = (database: SQLiteDatabase) => ({
  /**
   * Creates or replaces the latest local state for an inspection.
   * @param draft Complete draft snapshot to persist.
   */
  save: async (draft: InspectionDraft): Promise<void> => {
    if (draft.progress < 0 || draft.progress > 100) {
      throw new RangeError('Draft progress must be between 0 and 100.');
    }

    await database.runAsync(
      `INSERT INTO inspection_drafts (
        inspection_id, answers_json, progress, sync_status, retry_count,
        last_error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(inspection_id) DO UPDATE SET
        answers_json = excluded.answers_json,
        progress = excluded.progress,
        sync_status = excluded.sync_status,
        retry_count = excluded.retry_count,
        last_error = excluded.last_error,
        updated_at = excluded.updated_at`,
      draft.inspectionId,
      JSON.stringify(draft.answers),
      draft.progress,
      draft.syncStatus,
      draft.retryCount,
      draft.lastError,
      draft.createdAt,
      draft.updatedAt,
    );
  },

  /**
   * Returns the saved draft for an inspection, if one exists.
   * @param inspectionId Stable inspection identifier.
   */
  findByInspectionId: async (inspectionId: string): Promise<InspectionDraft | null> => {
    const row = await database.getFirstAsync<InspectionDraftRow>(
      'SELECT * FROM inspection_drafts WHERE inspection_id = ?',
      inspectionId,
    );

    return row ? mapDraftRow(row) : null;
  },

  /** Returns drafts that still need a synchronization decision. */
  listPending: async (): Promise<InspectionDraft[]> => {
    const rows = await database.getAllAsync<InspectionDraftRow>(
      `SELECT * FROM inspection_drafts
       WHERE sync_status IN ('pending', 'syncing', 'failed')
       ORDER BY updated_at ASC`,
    );

    return rows.map(mapDraftRow);
  },

  /** Adds a completed local draft to the upload queue. */
  queueForUpload: async (inspectionId: string, updatedAt: string): Promise<boolean> => {
    const result = await database.runAsync(
      `UPDATE inspection_drafts
       SET sync_status = 'pending', retry_count = 0, last_error = NULL, updated_at = ?
       WHERE inspection_id = ? AND sync_status = 'draft'`,
      updatedAt,
      inspectionId,
    );
    return result.changes === 1;
  },

  /** Marks a pending upload as in progress. */
  markSyncing: async (inspectionId: string, updatedAt: string): Promise<boolean> => {
    const result = await database.runAsync(
      `UPDATE inspection_drafts SET sync_status = 'syncing', updated_at = ?
       WHERE inspection_id = ? AND sync_status = 'pending'`,
      updatedAt,
      inspectionId,
    );
    return result.changes === 1;
  },

  /** Records a successful upload without deleting its local audit snapshot. */
  markSynced: async (inspectionId: string, updatedAt: string): Promise<boolean> => {
    const result = await database.runAsync(
      `UPDATE inspection_drafts SET sync_status = 'synced', last_error = NULL, updated_at = ?
       WHERE inspection_id = ? AND sync_status = 'syncing'`,
      updatedAt,
      inspectionId,
    );
    return result.changes === 1;
  },

  /** Records an upload failure and increments its retry counter. */
  markFailed: async (
    inspectionId: string,
    lastError: string,
    updatedAt: string,
  ): Promise<boolean> => {
    const result = await database.runAsync(
      `UPDATE inspection_drafts
       SET sync_status = 'failed', retry_count = retry_count + 1,
           last_error = ?, updated_at = ?
       WHERE inspection_id = ? AND sync_status = 'syncing'`,
      lastError,
      updatedAt,
      inspectionId,
    );
    return result.changes === 1;
  },

  /** Returns a failed upload to pending without hiding its retry count. */
  retry: async (inspectionId: string, updatedAt: string): Promise<boolean> => {
    const result = await database.runAsync(
      `UPDATE inspection_drafts
       SET sync_status = 'pending', last_error = NULL, updated_at = ?
       WHERE inspection_id = ? AND sync_status = 'failed'`,
      updatedAt,
      inspectionId,
    );
    return result.changes === 1;
  },

  /**
   * Removes a local draft after it is no longer needed.
   * @param inspectionId Stable inspection identifier.
   */
  remove: async (inspectionId: string): Promise<void> => {
    await database.runAsync('DELETE FROM inspection_drafts WHERE inspection_id = ?', inspectionId);
  },
});
