/** @fileoverview Coordinates remote assignment download and atomic local cache replacement. */

import type { AssignmentDownloadAdapter } from './assignment-adapter';
import type { AssignmentRepository } from './assignment-repository';
import type { Inspection } from './types';

export const refreshAssignments = async (
  repository: AssignmentRepository,
  adapter: AssignmentDownloadAdapter,
  now: () => string = () => new Date().toISOString(),
): Promise<Inspection[]> => {
  const assignments = await adapter.download();
  await repository.replaceAll(assignments, now());
  return assignments;
};
