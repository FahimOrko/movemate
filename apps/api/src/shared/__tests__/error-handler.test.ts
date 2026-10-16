import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '../error-handler';
import { AppError } from '../errors';

function appThrowing(error: unknown) {
  const app = express();
  app.use(express.json());
  app.post('/boom', () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('maps an AppError to its status and code', async () => {
    const res = await request(appThrowing(new AppError('not_found', 'Move not found'))).post('/boom');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'not_found', message: 'Move not found' } });
  });

  it('maps a ZodError to 400 validation_error', async () => {
    const zodError = z.object({ address: z.string() }).safeParse({}).error;

    const res = await request(appThrowing(zodError)).post('/boom');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.message).toMatch(/address/);
  });

  it('maps a malformed JSON body to 400', async () => {
    const res = await request(appThrowing(new Error('unreachable')))
      .post('/boom')
      .set('Content-Type', 'application/json')
      .send('{"address":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('hides details of unexpected errors', async () => {
    const res = await request(appThrowing(new Error('password=hunter2'))).post('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: 'internal_error', message: 'Something went wrong' } });
    expect(res.text).not.toContain('hunter2');
  });
});
