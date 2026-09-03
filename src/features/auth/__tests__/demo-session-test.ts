import { createDemoSession } from '../demo-session';

describe('createDemoSession', () => {
  test('returns an explicitly fictional local session', () => {
    expect(createDemoSession()).toEqual({
      accessToken: 'local-demo-session',
      kind: 'demo',
      user: {
        displayName: 'Ama Mensah',
        email: 'ama.mensah@demo.eavlabs.dev',
      },
    });
  });

  test('returns a new value so callers cannot mutate later sessions', () => {
    expect(createDemoSession()).not.toBe(createDemoSession());
  });
});
