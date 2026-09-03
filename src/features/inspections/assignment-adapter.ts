/** @fileoverview Authenticated adapter for field-officer assignment downloads. */

import type { ApiClient } from '@/src/shared/api/api-client';

import type { Inspection } from './types';

export type AssignmentDownloadAdapter = {
  download: () => Promise<Inspection[]>;
};

export const createAssignmentDownloadAdapter = (client: ApiClient): AssignmentDownloadAdapter => ({
  download: () => client.request<Inspection[]>('/api/v1/inspections/assignments'),
});
