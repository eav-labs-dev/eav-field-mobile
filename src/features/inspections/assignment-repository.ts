/**
 * @fileoverview SQLite cache for inspection assignments downloaded from the API.
 * @remarks A refresh is transactional so a partial response cannot erase the last usable cache.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Inspection, InspectionStatus } from './types';

type AssignmentRow = {
  inspection_id: string;
  reference: string;
  site_name: string;
  location: string;
  due_label: string;
  status: InspectionStatus;
  progress: number;
};

const mapRow = (row: AssignmentRow): Inspection => ({
  id: row.inspection_id,
  reference: row.reference,
  siteName: row.site_name,
  location: row.location,
  dueLabel: row.due_label,
  status: row.status,
  progress: row.progress,
});

const validateAssignment = (assignment: Inspection) => {
  if (!assignment.id.trim() || !assignment.reference.trim() || !assignment.siteName.trim()) {
    throw new Error('Downloaded assignments require an id, reference, and site name.');
  }
  if (assignment.progress < 0 || assignment.progress > 100) {
    throw new RangeError('Assignment progress must be between 0 and 100.');
  }
};

export const createAssignmentRepository = (database: SQLiteDatabase) => ({
  list: async (): Promise<Inspection[]> => {
    const rows = await database.getAllAsync<AssignmentRow>(
      'SELECT * FROM inspection_assignments ORDER BY due_label ASC, reference ASC',
    );
    return rows.map(mapRow);
  },

  findById: async (inspectionId: string): Promise<Inspection | null> => {
    const row = await database.getFirstAsync<AssignmentRow>(
      'SELECT * FROM inspection_assignments WHERE inspection_id = ?',
      inspectionId,
    );
    return row ? mapRow(row) : null;
  },

  replaceAll: async (assignments: Inspection[], downloadedAt: string): Promise<void> => {
    assignments.forEach(validateAssignment);

    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM inspection_assignments');
      for (const assignment of assignments) {
        await database.runAsync(
          `INSERT INTO inspection_assignments (
            inspection_id, reference, site_name, location, due_label,
            status, progress, downloaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          assignment.id,
          assignment.reference,
          assignment.siteName,
          assignment.location,
          assignment.dueLabel,
          assignment.status,
          assignment.progress,
          downloadedAt,
        );
      }
    });
  },
});

export type AssignmentRepository = ReturnType<typeof createAssignmentRepository>;
