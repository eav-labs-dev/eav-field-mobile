/**
 * @fileoverview Domain types for field inspection assignments.
 */

export type InspectionStatus = 'assigned' | 'in-progress' | 'draft' | 'submitted';

export type Inspection = {
  id: string;
  reference: string;
  siteName: string;
  location: string;
  dueLabel: string;
  status: InspectionStatus;
  progress: number;
};
