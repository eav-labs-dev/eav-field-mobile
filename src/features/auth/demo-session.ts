/** @fileoverview Explicit, fictional session used only by the opt-in portfolio demo. */

import type { StoredSession } from './session-storage';

export const createDemoSession = (): StoredSession => ({
  accessToken: 'local-demo-session',
  kind: 'demo',
  user: {
    displayName: 'Ama Mensah',
    email: 'ama.mensah@demo.eavlabs.dev',
  },
});
