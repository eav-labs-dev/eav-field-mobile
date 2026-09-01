/**
 * @fileoverview Deterministic demo assignments used before API integration.
 */

import type { Inspection } from './types';

export const mockInspections: Inspection[] = [
  {
    id: 'inspection-001',
    reference: 'INS-2041',
    siteName: 'North Ridge Water Station',
    location: 'Accra, Greater Accra',
    dueLabel: 'Due today, 4:00 PM',
    status: 'in-progress',
    progress: 60,
  },
  {
    id: 'inspection-002',
    reference: 'INS-2044',
    siteName: 'Tema Distribution Yard',
    location: 'Tema, Greater Accra',
    dueLabel: 'Due tomorrow',
    status: 'assigned',
    progress: 0,
  },
  {
    id: 'inspection-003',
    reference: 'INS-2038',
    siteName: 'Kasoa Service Centre',
    location: 'Kasoa, Central Region',
    dueLabel: 'Saved 18 minutes ago',
    status: 'draft',
    progress: 35,
  },
];

export const getInspectionSummary = (inspections: Inspection[]) => ({
  assigned: inspections.filter((inspection) => inspection.status === 'assigned').length,
  drafts: inspections.filter((inspection) => inspection.status === 'draft').length,
  inProgress: inspections.filter((inspection) => inspection.status === 'in-progress').length,
});
