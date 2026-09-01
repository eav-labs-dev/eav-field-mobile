/**
 * @fileoverview Central JSON API client for EAV Field network adapters.
 * @remarks Normalizes the EAV response envelope, timeouts, and safe error messages.
 */

export type ApiEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
  page?: unknown;
  sort?: unknown;
  filters?: unknown;
  error?: unknown;
};

type Fetcher = typeof fetch;

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly code: string,
    readonly details: unknown = null,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export type ApiClient = {
  request: <T>(path: string, init?: RequestInit, options?: ApiRequestOptions) => Promise<T>;
};

type ApiRequestOptions = {
  authenticated?: boolean;
};

type ApiClientOptions = {
  baseUrl: string;
  fetcher?: Fetcher;
  getAccessToken?: () => Promise<string | null>;
  timeoutMs?: number;
};

const parseEnvelope = async <T>(response: Response): Promise<ApiEnvelope<T> | null> => {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
};

/**
 * Creates the shared HTTP boundary used by feature adapters.
 * @param options Base URL, optional fetch implementation, and timeout.
 */
export const createApiClient = ({
  baseUrl,
  fetcher = fetch,
  getAccessToken,
  timeoutMs = 15_000,
}: ApiClientOptions): ApiClient => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  if (!normalizedBaseUrl) throw new Error('An API base URL is required.');

  return {
    request: async <T>(
      path: string,
      init: RequestInit = {},
      options: ApiRequestOptions = {},
    ): Promise<T> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const accessToken =
          options.authenticated === false || !getAccessToken ? null : await getAccessToken();
        const isMultipartBody = typeof FormData !== 'undefined' && init.body instanceof FormData;
        const response = await fetcher(`${normalizedBaseUrl}/${path.replace(/^\/+/, '')}`, {
          ...init,
          headers: {
            Accept: 'application/json',
            ...(isMultipartBody ? {} : { 'Content-Type': 'application/json' }),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...init.headers,
          },
          signal: controller.signal,
        });
        const envelope = await parseEnvelope<T>(response);

        if (!response.ok || !envelope?.success) {
          throw new ApiClientError(
            envelope?.message || `Request failed with status ${response.status}.`,
            response.status,
            envelope?.code || 'HTTP_REQUEST_FAILED',
            envelope?.error,
          );
        }

        return envelope.data;
      } catch (error) {
        if (error instanceof ApiClientError) throw error;
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiClientError('The request timed out.', null, 'REQUEST_TIMEOUT');
        }
        throw new ApiClientError('The server could not be reached.', null, 'NETWORK_UNAVAILABLE');
      } finally {
        clearTimeout(timeout);
      }
    },
  };
};
