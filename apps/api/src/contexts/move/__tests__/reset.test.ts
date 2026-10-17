import fs from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../db/client';
import { env } from '../../../env';
import { completeJson } from '../../../shared/ai/openrouter.client';
import { app, createMove, uploadPhoto } from '../../inspection/__tests__/helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
const ai = vi.mocked(completeJson);

const originalNodeEnv = env.NODE_ENV;
const tables = ['moves', 'photos', 'findings', 'reports'] as const;

async function rowCount(table: (typeof tables)[number]): Promise<number> {
  const result = await db.execute<{ count: string }>(sql.raw(`select count(*) from ${table}`));
  return Number(result.rows[0]?.count);
}

beforeEach(() => {
  ai.mockReset();
});

afterEach(() => {
  env.NODE_ENV = originalNodeEnv;
});

describe('POST /api/reset', () => {
  it('removes moves, photos, findings and reports, and empties the upload folder but keeps it', async () => {
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    await uploadPhoto(id, 'kitchen', 'move_in');
    ai.mockResolvedValue({
      findings: [{ status: 'changed', summary: 'A mark may be visible.', confidence: 'high', check_number: null, before_photo_indexes: [1], move_in_photo_indexes: [2] }],
    });
    await request(app).post(`/api/moves/${id}/inspection/compare`).expect(200);
    const findingId: string = (await request(app).get(`/api/moves/${id}/findings`)).body.data[0].id;
    await request(app).patch(`/api/findings/${findingId}`).send({ resolution: 'ok' }).expect(200);
    await request(app).post(`/api/moves/${id}/reports`).expect(201);
    const uploadRoot = path.resolve(env.UPLOAD_DIR);
    expect(fs.readdirSync(uploadRoot)).not.toHaveLength(0);

    await request(app).post('/api/reset').expect(204);

    for (const table of tables) expect(await rowCount(table)).toBe(0);
    expect(fs.existsSync(uploadRoot)).toBe(true);
    expect(fs.readdirSync(uploadRoot)).toEqual([]);
    expect((await request(app).get('/api/moves/current')).body).toEqual({ data: null });
  });

  it('works on an empty database', async () => {
    await request(app).post('/api/reset').expect(204);
  });

  it('404s in production and deletes nothing', async () => {
    await request(app).post('/api/moves').send({ address: 'Aurakatu 12' });
    env.NODE_ENV = 'production';

    const res = await request(app).post('/api/reset');

    expect(res.status).toBe(404);
    expect(await rowCount('moves')).toBe(1);
  });
});
