import { createApiClient } from '../api-client';

const response = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: jest.fn().mockResolvedValue(body) }) as unknown as Response;

describe('createApiClient', () => {
  test('normalizes the base URL and returns envelope data', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      response({ success: true, code: 'OK', message: 'Uploaded', data: { id: 'sub-1' } }),
    );
    const client = createApiClient({ baseUrl: 'https://api.example.com/', fetcher });

    await expect(
      client.request<{ id: string }>('/api/v1/inspections', {
        method: 'POST',
        body: '{}',
      }),
    ).resolves.toEqual({ id: 'sub-1' });
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/inspections',
      expect.objectContaining({ method: 'POST', body: '{}' }),
    );
  });

  test('surfaces the API error code and safe message', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      response(
        {
          success: false,
          code: 'INSPECTION_REJECTED',
          message: 'Inspection could not be accepted.',
          data: null,
          error: { field: 'progress' },
        },
        false,
        422,
      ),
    );
    const client = createApiClient({ baseUrl: 'https://api.example.com', fetcher });

    await expect(client.request('/submission')).rejects.toMatchObject({
      message: 'Inspection could not be accepted.',
      status: 422,
      code: 'INSPECTION_REJECTED',
    });
  });

  test('normalizes fetch failures without exposing implementation details', async () => {
    const client = createApiClient({
      baseUrl: 'https://api.example.com',
      fetcher: jest.fn().mockRejectedValue(new TypeError('socket detail')),
    });

    await expect(client.request('/submission')).rejects.toMatchObject({
      message: 'The server could not be reached.',
      code: 'NETWORK_UNAVAILABLE',
    });
  });
});
