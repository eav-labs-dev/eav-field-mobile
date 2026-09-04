/**
 * @fileoverview Domain model and progress rules for the inspection form.
 */

export type SiteCondition = 'good' | 'fair' | 'poor' | '';

export type PhotoAttachment = {
  id: string;
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  width: number;
  height: number;
  source: 'camera' | 'library';
  addedAt: string;
};

export type InspectionFormAnswers = {
  contactName: string;
  safetyBriefingCompleted: boolean | null;
  siteCondition: SiteCondition;
  notes: string;
  photos: PhotoAttachment[];
};

export const emptyInspectionForm: InspectionFormAnswers = {
  contactName: '',
  safetyBriefingCompleted: null,
  siteCondition: '',
  notes: '',
  photos: [],
};

const isSiteCondition = (value: unknown): value is SiteCondition =>
  value === '' || value === 'good' || value === 'fair' || value === 'poor';

const isPhotoAttachment = (value: unknown): value is PhotoAttachment => {
  if (!value || typeof value !== 'object') return false;

  const photo = value as Record<string, unknown>;
  return (
    typeof photo.id === 'string' &&
    typeof photo.uri === 'string' &&
    (typeof photo.fileName === 'string' || photo.fileName === null) &&
    (typeof photo.mimeType === 'string' || photo.mimeType === null) &&
    typeof photo.width === 'number' &&
    typeof photo.height === 'number' &&
    (photo.source === 'camera' || photo.source === 'library') &&
    typeof photo.addedAt === 'string'
  );
};

/**
 * Safely converts persisted JSON data into form answers.
 * @param value Unknown value read from local storage.
 */
export const normalizeInspectionForm = (value: unknown): InspectionFormAnswers => {
  if (!value || typeof value !== 'object') return emptyInspectionForm;

  const answers = value as Record<string, unknown>;
  return {
    contactName: typeof answers.contactName === 'string' ? answers.contactName : '',
    safetyBriefingCompleted:
      typeof answers.safetyBriefingCompleted === 'boolean'
        ? answers.safetyBriefingCompleted
        : null,
    siteCondition: isSiteCondition(answers.siteCondition) ? answers.siteCondition : '',
    notes: typeof answers.notes === 'string' ? answers.notes : '',
    photos: Array.isArray(answers.photos) ? answers.photos.filter(isPhotoAttachment) : [],
  };
};

/**
 * Calculates completion from the four MVP inspection fields.
 * @param answers Current form answers.
 */
export const calculateInspectionProgress = (answers: InspectionFormAnswers): number => {
  const completedFields = [
    answers.contactName.trim().length > 0,
    answers.safetyBriefingCompleted !== null,
    answers.siteCondition.length > 0,
    answers.notes.trim().length > 0,
  ].filter(Boolean).length;

  return completedFields * 25;
};
