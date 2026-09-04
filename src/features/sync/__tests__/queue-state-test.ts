import { transitionQueueState } from '../queue-state';

describe('transitionQueueState', () => {
  test('follows the successful upload lifecycle', () => {
    expect(transitionQueueState('draft', 'enqueue')).toBe('pending');
    expect(transitionQueueState('pending', 'start')).toBe('syncing');
    expect(transitionQueueState('syncing', 'succeed')).toBe('synced');
  });

  test('supports failure and an explicit retry', () => {
    expect(transitionQueueState('syncing', 'fail')).toBe('failed');
    expect(transitionQueueState('failed', 'retry')).toBe('pending');
  });

  test('rejects skipped or repeated transitions', () => {
    expect(() => transitionQueueState('draft', 'succeed')).toThrow(
      'Cannot apply succeed while an inspection is draft.',
    );
    expect(() => transitionQueueState('synced', 'retry')).toThrow();
  });
});
