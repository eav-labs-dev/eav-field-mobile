/**
 * @fileoverview Explicit state machine for offline inspection uploads.
 * @remarks Network adapters may request transitions, but cannot skip queue states.
 */

export type DraftSyncStatus = 'draft' | 'pending' | 'syncing' | 'failed' | 'synced';

export type QueueEvent = 'enqueue' | 'start' | 'succeed' | 'fail' | 'retry';

const transitions: Record<DraftSyncStatus, Partial<Record<QueueEvent, DraftSyncStatus>>> = {
  draft: { enqueue: 'pending' },
  pending: { start: 'syncing' },
  syncing: { fail: 'failed', succeed: 'synced' },
  failed: { retry: 'pending' },
  synced: {},
};

/**
 * Returns the next queue state or rejects an invalid transition.
 * @param current Current persisted synchronization state.
 * @param event Requested queue event.
 */
export const transitionQueueState = (
  current: DraftSyncStatus,
  event: QueueEvent,
): DraftSyncStatus => {
  const next = transitions[current][event];
  if (!next) {
    throw new Error(`Cannot apply ${event} while an inspection is ${current}.`);
  }

  return next;
};
