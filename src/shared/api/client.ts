/**
 * @fileoverview Configured EAV Field API client.
 * @remarks Public Expo variables contain routing configuration only, never credentials.
 */

import { createApiClient } from './api-client';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:8000';
const configuredTimeout = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS);
const timeoutMs =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 15_000;

export const apiClient = createApiClient({ baseUrl: apiBaseUrl, timeoutMs });
