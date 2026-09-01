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
        photos: [],
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
        photos: [
          {
            id: 'photo-1',
            uri: 'file:///photo.jpg',
            fileName: 'photo.jpg',
            mimeType: 'image/jpeg',
            width: 100,
            height: 80,
            source: 'camera',
            addedAt: '2026-08-24T08:00:00.000Z',
          },
          { id: 42, uri: false },
        ],
      }),
    ).toEqual({
      contactName: 'Ama',
      safetyBriefingCompleted: false,
      siteCondition: 'poor',
      notes: 'Follow-up required',
      photos: [
        {
          id: 'photo-1',
          uri: 'file:///photo.jpg',
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
          width: 100,
          height: 80,
          source: 'camera',
          addedAt: '2026-08-24T08:00:00.000Z',
        },
      ],
    });
  });

  test('falls back safely for malformed persisted data', () => {
    expect(normalizeInspectionForm({ siteCondition: 'unknown', notes: 42 })).toEqual(
      emptyInspectionForm,
    );
  });
});
