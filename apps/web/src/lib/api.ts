import { errorBodySchema } from '@movemate/contracts';

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(payload);
    throw parsed.success
      ? new ApiError(parsed.data.error.code, parsed.data.error.message)
      : new ApiError('unexpected_error', 'Something went wrong');
  }
  // shortcut: the unwrapped data is trusted, not re-validated with the contract schema; validate in the hooks if the API drifts.
  return (payload as { data: T }).data;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
};
