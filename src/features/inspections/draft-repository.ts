/**
 * @fileoverview SQLite repository for inspection drafts created offline.
 * @remarks All draft values use bound parameters and answers are serialized as JSON.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

export type DraftSyncStatus = 'draft' | 'pending' | 'syncing' | 'failed' | 'synced';

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
       WHERE sync_status IN ('draft', 'pending', 'failed')
       ORDER BY updated_at ASC`,
    );

    return rows.map(mapDraftRow);
  },

  /**
   * Removes a local draft after it is no longer needed.
   * @param inspectionId Stable inspection identifier.
   */
  remove: async (inspectionId: string): Promise<void> => {
    await database.runAsync('DELETE FROM inspection_drafts WHERE inspection_id = ?', inspectionId);
  },
});
