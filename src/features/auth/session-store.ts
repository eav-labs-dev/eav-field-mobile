/**
 * @fileoverview Authenticated client-side session state for EAV Field.
 * @remarks Credentials are exchanged through the API and tokens remain in SecureStore.
 */

import { create } from 'zustand';

import { isDemoModeEnabled } from '@/src/shared/config/demo-mode';

import { authenticate } from './auth-service';
import { createDemoSession } from './demo-session';
import {
  clearStoredSession,
  readStoredSession,
  type StoredSession,
  writeStoredSession,
} from './session-storage';

type SessionStatus = 'idle' | 'restoring' | 'authenticated' | 'anonymous';

type SessionState = {
  displayName: string;
  email: string;
  errorMessage: string | null;
  isAuthenticated: boolean;
  isSigningIn: boolean;
  status: SessionStatus;
  restoreSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
};

const authenticatedState = (session: StoredSession) => ({
  displayName: session.user.displayName,
  email: session.user.email,
  errorMessage: null,
  isAuthenticated: true,
  isSigningIn: false,
  status: 'authenticated' as const,
});

export const useSessionStore = create<SessionState>((set) => ({
  displayName: '',
  email: '',
  errorMessage: null,
  isAuthenticated: false,
  isSigningIn: false,
  status: 'idle',
  restoreSession: async () => {
    set({ errorMessage: null, status: 'restoring' });
    try {
      const session = await readStoredSession();
      if (session?.kind === 'demo' && !isDemoModeEnabled()) {
        await clearStoredSession();
        set({ displayName: '', email: '', isAuthenticated: false, status: 'anonymous' });
        return;
      }
      set(
        session
          ? authenticatedState(session)
          : { displayName: '', email: '', isAuthenticated: false, status: 'anonymous' },
      );
    } catch {
      set({
        displayName: '',
        email: '',
        errorMessage: 'The saved session could not be restored. Sign in again.',
        isAuthenticated: false,
        status: 'anonymous',
      });
    }
  },
  signIn: async (email, password) => {
    set({ errorMessage: null, isSigningIn: true });
    try {
      const session = await authenticate({ email: email.trim(), password });
      await writeStoredSession(session);
      set(authenticatedState(session));
      return true;
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error ? error.message : 'Sign-in failed. Check your details and try again.',
        isAuthenticated: false,
        isSigningIn: false,
        status: 'anonymous',
      });
      return false;
    }
  },
  signInDemo: async () => {
    const session = createDemoSession();
    await writeStoredSession(session);
    set(authenticatedState(session));
  },
  signOut: async () => {
    await clearStoredSession();
    set({
      displayName: '',
      email: '',
      errorMessage: null,
      isAuthenticated: false,
      isSigningIn: false,
      status: 'anonymous',
    });
  },
}));
