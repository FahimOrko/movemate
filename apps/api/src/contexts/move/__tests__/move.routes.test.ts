import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../../app';

const app = createApp();
const unknownId = '00000000-0000-4000-8000-000000000000';

describe('move routes', () => {
  it('POST /api/moves creates a move', async () => {
    const res = await request(app).post('/api/moves').send({ address: ' Aurakatu 12 ', moveDate: '2026-11-01' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ address: 'Aurakatu 12', moveDate: '2026-11-01', phase: 'prepare' });
  });

  it.each([
    ['empty address', { address: '  ' }],
    ['bad date', { address: 'Aurakatu 12', moveDate: 'tomorrow' }],
  ])('POST /api/moves rejects %s with 400', async (_name, body) => {
    const res = await request(app).post('/api/moves').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('GET /api/moves/current is null without a move, then the latest', async () => {
    expect((await request(app).get('/api/moves/current')).body).toEqual({ data: null });

    await request(app).post('/api/moves').send({ address: 'First' });
    await request(app).post('/api/moves').send({ address: 'Second' });

    expect((await request(app).get('/api/moves/current')).body.data.address).toBe('Second');
  });

  it('POST /api/moves/:id/advance moves to the next phase', async () => {
    const { body } = await request(app).post('/api/moves').send({ address: 'Aurakatu 12' });

    const res = await request(app).post(`/api/moves/${body.data.id}/advance`);

    expect(res.status).toBe(200);
    expect(res.body.data.phase).toBe('before_photos');
  });

  it('POST /api/moves/:id/advance returns 409 from move_in', async () => {
    const { body } = await request(app).post('/api/moves').send({ address: 'Aurakatu 12' });
    await request(app).post(`/api/moves/${body.data.id}/advance`);
    await request(app).post(`/api/moves/${body.data.id}/advance`);

    const res = await request(app).post(`/api/moves/${body.data.id}/advance`);

    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({
      code: 'invalid_phase_transition',
      message: 'Generate the report to continue',
    });
  });

  it('POST /api/moves/:id/advance returns 404 for an unknown move and 400 for a bad id', async () => {
    expect((await request(app).post(`/api/moves/${unknownId}/advance`)).status).toBe(404);
    expect((await request(app).post('/api/moves/not-a-uuid/advance')).status).toBe(400);
  });
});
