import { errorBodySchema } from '@movemate/contracts';
import type { ZodType } from 'zod';

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

type Body = { json?: unknown; form?: FormData };

async function send(method: string, path: string, { json, form }: Body = {}): Promise<unknown> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: json === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
  });
  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(payload);
    throw parsed.success
      ? new ApiError(parsed.data.error.code, parsed.data.error.message)
      : new ApiError('unexpected_error', 'Something went wrong');
  }
  return payload;
}

async function request<T>(schema: ZodType<T>, method: string, path: string, body?: Body): Promise<T> {
  const payload = await send(method, path, body);
  const parsed = schema.safeParse(payload && typeof payload === 'object' && 'data' in payload ? payload.data : undefined);
  if (!parsed.success) throw new ApiError('unexpected_response', 'The server sent an unexpected response');
  return parsed.data;
}

export const api = {
  get: <T>(path: string, schema: ZodType<T>) => request(schema, 'GET', path),
  post: <T>(path: string, schema: ZodType<T>, json?: unknown) => request(schema, 'POST', path, { json }),
  put: <T>(path: string, schema: ZodType<T>, json?: unknown) => request(schema, 'PUT', path, { json }),
  patch: <T>(path: string, schema: ZodType<T>, json?: unknown) => request(schema, 'PATCH', path, { json }),
  upload: <T>(path: string, schema: ZodType<T>, form: FormData) => request(schema, 'POST', path, { form }),
  delete: async (path: string): Promise<void> => {
    await send('DELETE', path);
  },
};
