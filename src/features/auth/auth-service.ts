/**
 * @fileoverview Authentication adapter for the EAV Field API.
 * @remarks Passwords are sent only to the login endpoint and are never persisted locally.
 */

import { apiClient } from '@/src/shared/api/client';

import { StoredSession } from './session-storage';

export type LoginCredentials = {
  email: string;
  password: string;
};

/** Exchanges credentials for the normalized authenticated session contract. */
export const authenticate = (credentials: LoginCredentials) =>
  apiClient.request<StoredSession>(
    '/api/v1/auth/login',
    {
      body: JSON.stringify(credentials),
      method: 'POST',
    },
    { authenticated: false },
  );
