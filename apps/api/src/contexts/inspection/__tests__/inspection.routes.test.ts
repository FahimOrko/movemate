import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../shared/errors';
import { completeJson } from '../../../shared/ai/openrouter.client';
import { app, createMove, uploadBefore } from './helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
const ai = vi.mocked(completeJson);

const unknownId = '00000000-0000-4000-8000-000000000000';

beforeEach(() => {
  ai.mockReset();
});

describe('POST /moves/:id/inspection/baseline', () => {
  it('returns the checks and failed rooms', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockResolvedValue({ checks: ['Look at the tap for drips'] });

    const res = await request(app).post(`/api/moves/${id}/inspection/baseline`).expect(200);

    expect(res.body.data.failedRooms).toEqual([]);
    expect(res.body.data.checks).toHaveLength(1);
  });

  it('409s before the before-photos phase', async () => {
    const id = await createMove(0);
    await request(app).post(`/api/moves/${id}/inspection/baseline`).expect(409);
  });

  it('409s without before photos', async () => {
    const id = await createMove();
    const res = await request(app).post(`/api/moves/${id}/inspection/baseline`).expect(409);
    expect(res.body.error.message).toMatch(/before photos/);
  });

  it('502s when the AI fails', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockImplementation(async () => {
      throw new AppError('ai_failure', 'The AI rate limit was reached.');
    });
    const res = await request(app).post(`/api/moves/${id}/inspection/baseline`).expect(502);
    expect(res.body.error).toEqual({ code: 'ai_failure', message: 'The AI rate limit was reached.' });
  });

  it('503s when AI is not configured', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockImplementation(async () => {
      throw new AppError('ai_not_configured', 'AI is not configured. Add checks by hand.');
    });
    const res = await request(app).post(`/api/moves/${id}/inspection/baseline`).expect(503);
    expect(res.body.error.code).toBe('ai_not_configured');
  });

  it('400s for a bad rooms list and 404s for an unknown move', async () => {
    const id = await createMove();
    await request(app).post(`/api/moves/${id}/inspection/baseline`).send({ rooms: ['garage'] }).expect(400);
    await request(app).post(`/api/moves/${unknownId}/inspection/baseline`).expect(404);
  });
});

describe('room checks', () => {
  it('adds, lists and deletes a user check', async () => {
    const id = await createMove();
    const created = await request(app).post(`/api/moves/${id}/room-checks`).send({ room: 'kitchen', text: '  Look at the oven  ' }).expect(201);
    expect(created.body.data).toMatchObject({ room: 'kitchen', text: 'Look at the oven', source: 'user' });

    const list = await request(app).get(`/api/moves/${id}/room-checks`).expect(200);
    expect(list.body.data).toHaveLength(1);

    await request(app).delete(`/api/room-checks/${created.body.data.id}`).expect(204);
    expect((await request(app).get(`/api/moves/${id}/room-checks`)).body.data).toEqual([]);
  });

  it('400s for empty text, text over 300 characters and an unknown room', async () => {
    const id = await createMove();
    const post = (body: object) => request(app).post(`/api/moves/${id}/room-checks`).send(body);
    await post({ room: 'kitchen', text: '   ' }).expect(400);
    await post({ room: 'kitchen', text: 'x'.repeat(301) }).expect(400);
    await post({ room: 'garage', text: 'ok' }).expect(400);
  });

  it('409s when adding a check before the before-photos phase', async () => {
    const id = await createMove(0);
    await request(app).post(`/api/moves/${id}/room-checks`).send({ room: 'kitchen', text: 'ok' }).expect(409);
  });

  it('404s when deleting an unknown check', async () => {
    await request(app).delete(`/api/room-checks/${unknownId}`).expect(404);
  });
});
