/**
 * @fileoverview Unit coverage for inspection-form normalization and progress.
 */

import {
  calculateInspectionProgress,
  emptyInspectionForm,
  normalizeInspectionForm,
} from '../inspection-form';

describe('inspection form', () => {
  test('calculates progress from completed fields', () => {
    expect(
      calculateInspectionProgress({
        contactName: 'Kojo Mensah',
        safetyBriefingCompleted: true,
        siteCondition: 'fair',
        notes: '',
      }),
    ).toBe(75);
  });

  test('normalizes valid persisted answers', () => {
    expect(
      normalizeInspectionForm({
        contactName: 'Ama',
        safetyBriefingCompleted: false,
        siteCondition: 'poor',
        notes: 'Follow-up required',
      }),
    ).toEqual({
      contactName: 'Ama',
      safetyBriefingCompleted: false,
      siteCondition: 'poor',
      notes: 'Follow-up required',
    });
  });

  test('falls back safely for malformed persisted data', () => {
    expect(normalizeInspectionForm({ siteCondition: 'unknown', notes: 42 })).toEqual(
      emptyInspectionForm,
    );
  });
});
