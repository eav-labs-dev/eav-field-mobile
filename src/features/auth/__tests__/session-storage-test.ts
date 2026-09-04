/**
 * @fileoverview Tests for validation and lifecycle of securely persisted sessions.
 */

const mockSecureValues = new Map<string, string>();

jest.mock(
  'expo-secure-store',
  () => ({
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
    deleteItemAsync: jest.fn(async (key: string) => mockSecureValues.delete(key)),
    getItemAsync: jest.fn(async (key: string) => mockSecureValues.get(key) ?? null),
    isAvailableAsync: jest.fn(async () => true),
    setItemAsync: jest.fn(async (key: string, value: string) => mockSecureValues.set(key, value)),
  }),
  { virtual: true },
);

import {
  clearStoredSession,
  getStoredAccessToken,
  readStoredSession,
  writeStoredSession,
} from '../session-storage';

const session = {
  accessToken: 'access-token',
  user: { displayName: 'Ama Mensah', email: 'ama@example.com' },
};

describe('session storage', () => {
  beforeEach(async () => {
    mockSecureValues.clear();
    await clearStoredSession();
  });

  test('round-trips a validated session and exposes only its access token', async () => {
    await writeStoredSession(session);

    await expect(readStoredSession()).resolves.toEqual(session);
    await expect(getStoredAccessToken()).resolves.toBe('access-token');
  });

  test('clears malformed secure values instead of restoring them', async () => {
    mockSecureValues.set('eav-field.auth-session.v1', '{"accessToken":false}');

    await expect(readStoredSession()).resolves.toBeNull();
    expect(mockSecureValues.size).toBe(0);
  });

  test('does not expose a fictional demo token to API requests', async () => {
    await writeStoredSession({ ...session, kind: 'demo' });

    await expect(getStoredAccessToken()).resolves.toBeNull();
  });
});
