import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../../app';

const app = createApp();

async function createMove(): Promise<string> {
  const res = await request(app).post('/api/moves').send({ address: 'Aurakatu 12' });
  return res.body.data.id;
}

describe('guidance routes', () => {
  it('GET /api/guidance/prepare returns the checklist and tips', async () => {
    const res = await request(app).get('/api/guidance/prepare');

    expect(res.status).toBe(200);
    expect(res.body.data.checklist.length).toBeGreaterThan(0);
    expect(res.body.data.tips.length).toBeGreaterThan(0);
  });

  it('GET defaults every template item to pending', async () => {
    const id = await createMove();

    const res = await request(app).get(`/api/moves/${id}/guidance`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((item: { status: string }) => item.status === 'pending')).toBe(true);
  });

  it.each(['done', 'no', 'na', 'pending'])('PATCH status %s returns 200 and persists', async (status) => {
    const id = await createMove();

    const patch = await request(app).patch(`/api/moves/${id}/guidance/sign-lease`).send({ status });

    expect(patch.status).toBe(200);
    expect(patch.body.data).toMatchObject({ key: 'sign-lease', status });
    const list = (await request(app).get(`/api/moves/${id}/guidance`)).body.data;
    expect(list.find((item: { key: string }) => item.key === 'sign-lease').status).toBe(status);
  });

  it('PATCH returns 404 for an unknown item key and an unknown move', async () => {
    const id = await createMove();

    expect((await request(app).patch(`/api/moves/${id}/guidance/nope`).send({ status: 'done' })).status).toBe(404);
    expect(
      (
        await request(app)
          .patch('/api/moves/00000000-0000-4000-8000-000000000000/guidance/sign-lease')
          .send({ status: 'done' })
      ).status,
    ).toBe(404);
  });

  it.each([{ status: 'yes' }, { completed: true }, {}])('PATCH returns 400 for the body %j', async (body) => {
    const id = await createMove();

    const res = await request(app).patch(`/api/moves/${id}/guidance/sign-lease`).send(body);

    expect(res.status).toBe(400);
  });

  it('GET /api/moves/:id/guidance returns 404 for an unknown move', async () => {
    const res = await request(app).get('/api/moves/00000000-0000-4000-8000-000000000000/guidance');

    expect(res.status).toBe(404);
  });
});
