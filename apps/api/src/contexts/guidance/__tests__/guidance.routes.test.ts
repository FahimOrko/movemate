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

  it('PATCH toggles an item and the tick persists', async () => {
    const id = await createMove();
    expect((await request(app).get(`/api/moves/${id}/guidance`)).body.data).toEqual([]);

    const patch = await request(app).patch(`/api/moves/${id}/guidance/sign-lease`).send({ completed: true });

    expect(patch.status).toBe(200);
    expect(patch.body.data).toEqual({ itemKey: 'sign-lease', completed: true });
    expect((await request(app).get(`/api/moves/${id}/guidance`)).body.data).toEqual([
      { itemKey: 'sign-lease', completed: true },
    ]);
  });

  it('PATCH returns 404 for an unknown item key and an unknown move', async () => {
    const id = await createMove();

    expect((await request(app).patch(`/api/moves/${id}/guidance/nope`).send({ completed: true })).status).toBe(404);
    expect(
      (
        await request(app)
          .patch('/api/moves/00000000-0000-4000-8000-000000000000/guidance/sign-lease')
          .send({ completed: true })
      ).status,
    ).toBe(404);
  });

  it('PATCH returns 400 for a bad body', async () => {
    const id = await createMove();

    const res = await request(app).patch(`/api/moves/${id}/guidance/sign-lease`).send({ completed: 'yes' });

    expect(res.status).toBe(400);
  });

  it('GET /api/moves/:id/guidance returns 404 for an unknown move', async () => {
    const res = await request(app).get('/api/moves/00000000-0000-4000-8000-000000000000/guidance');

    expect(res.status).toBe(404);
  });
});
