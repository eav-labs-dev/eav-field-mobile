/**
 * @fileoverview Domain model and progress rules for the inspection form.
 */

export type SiteCondition = 'good' | 'fair' | 'poor' | '';

export type InspectionFormAnswers = {
  contactName: string;
  safetyBriefingCompleted: boolean | null;
  siteCondition: SiteCondition;
  notes: string;
};

export const emptyInspectionForm: InspectionFormAnswers = {
  contactName: '',
  safetyBriefingCompleted: null,
  siteCondition: '',
  notes: '',
};

const isSiteCondition = (value: unknown): value is SiteCondition =>
  value === '' || value === 'good' || value === 'fair' || value === 'poor';

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
