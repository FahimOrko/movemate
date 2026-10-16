import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import { pingDatabase } from '../db/client';

vi.mock('../db/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db/client')>();
  return { ...actual, pingDatabase: vi.fn(actual.pingDatabase) };
});

describe('GET /api/health', () => {
  it('reports the database as connected', async () => {
    const res = await request(createApp()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: 'ok', db: 'connected' } });
  });

  it('returns 503 when the database is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(pingDatabase).mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const res = await request(createApp()).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: { code: 'db_unavailable', message: 'Database is not reachable' } });
  });
});

describe('unknown /api routes', () => {
  it('return a 404 error envelope', async () => {
    const res = await request(createApp()).get('/api/nope');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'not_found', message: 'Route not found' } });
  });
});
