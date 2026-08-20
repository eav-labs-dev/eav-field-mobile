/**
 * @fileoverview Unit coverage for inspection dashboard summaries.
 */

import { getInspectionSummary } from '../mock-inspections';
import type { Inspection } from '../types';

describe('getInspectionSummary', () => {
  test('counts each actionable status', () => {
    const inspections: Inspection[] = [
      { id: '1', reference: 'A', siteName: 'A', location: 'A', dueLabel: 'A', status: 'assigned', progress: 0 },
      { id: '2', reference: 'B', siteName: 'B', location: 'B', dueLabel: 'B', status: 'draft', progress: 20 },
      { id: '3', reference: 'C', siteName: 'C', location: 'C', dueLabel: 'C', status: 'in-progress', progress: 50 },
    ];

    expect(getInspectionSummary(inspections)).toEqual({ assigned: 1, drafts: 1, inProgress: 1 });
  });
});
