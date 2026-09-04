/**
 * @fileoverview Secure persistence boundary for authenticated mobile sessions.
 * @remarks Native sessions use Expo SecureStore. Web sessions remain memory-only.
 */

import * as SecureStore from 'expo-secure-store';

export type StoredSession = {
  accessToken: string;
  kind?: 'api' | 'demo';
  user: {
    displayName: string;
    email: string;
  };
};

const SESSION_KEY = 'eav-field.auth-session.v1';
let memorySession: string | null = null;

const isStoredSession = (value: unknown): value is StoredSession => {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<StoredSession>;
  return Boolean(
    session.accessToken &&
      (session.kind === undefined || session.kind === 'api' || session.kind === 'demo') &&
      session.user?.displayName &&
      session.user?.email &&
      typeof session.accessToken === 'string' &&
      typeof session.user.displayName === 'string' &&
      typeof session.user.email === 'string',
  );
};

const readRawSession = async () => {
  if (!(await SecureStore.isAvailableAsync())) return memorySession;
  return SecureStore.getItemAsync(SESSION_KEY);
};

/** Stores the small authentication payload outside SQLite. */
export const writeStoredSession = async (session: StoredSession) => {
  const serialized = JSON.stringify(session);
  if (!(await SecureStore.isAvailableAsync())) {
    memorySession = serialized;
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, serialized, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
};

/** Returns a validated session and removes malformed persisted values. */
export const readStoredSession = async (): Promise<StoredSession | null> => {
  const serialized = await readRawSession();
  if (!serialized) return null;

  try {
    const session: unknown = JSON.parse(serialized);
    if (isStoredSession(session)) return session;
  } catch {
    // Invalid values are cleared below and never exposed to callers.
  }

  await clearStoredSession();
  return null;
};

/** Supplies a fresh token to the API client for every authenticated request. */
export const getStoredAccessToken = async () => {
  const session = await readStoredSession();
  return session?.kind === 'demo' ? null : session?.accessToken ?? null;
};

/** Clears native and in-memory session copies during sign-out. */
export const clearStoredSession = async () => {
  memorySession = null;
  if (await SecureStore.isAvailableAsync()) await SecureStore.deleteItemAsync(SESSION_KEY);
};
