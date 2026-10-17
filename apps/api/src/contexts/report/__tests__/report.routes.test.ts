import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeJson } from '../../../shared/ai/openrouter.client';
import { app, createMove, uploadPhoto } from '../../inspection/__tests__/helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
const ai = vi.mocked(completeJson);

const unknownId = '00000000-0000-4000-8000-000000000000';
const oneFinding = {
  findings: [{ status: 'changed' as const, summary: 'A mark may be visible.', confidence: 'high' as const, check_number: null, before_photo_indexes: [1], move_in_photo_indexes: [2] }],
};

async function moveInMove() {
  const id = await createMove(2);
  await uploadPhoto(id, 'kitchen', 'before');
  await uploadPhoto(id, 'kitchen', 'move_in');
  return id;
}

async function comparedMove() {
  const id = await moveInMove();
  ai.mockResolvedValue(oneFinding);
  const finding = (await request(app).post(`/api/moves/${id}/inspection/compare`).expect(200)).body.data.findings[0];
  return { id, finding };
}

const generate = (id: string) => request(app).post(`/api/moves/${id}/reports`);

beforeEach(() => {
  ai.mockReset();
});

describe('POST /moves/:id/reports', () => {
  it('409s while a finding is pending, then generates once it is answered', async () => {
    const { id, finding } = await comparedMove();
    await generate(id).expect(409);
    await request(app).patch(`/api/findings/${finding.id}`).send({ resolution: 'issue', note: 'Scratch' }).expect(200);
    const res = await generate(id).expect(201);
    expect(res.body.data.snapshot.issues).toHaveLength(1);
    expect(res.body.data.snapshot.issues[0].beforePhotos[0].url).toMatch(/^\/api\/photos\/.+\/file$/);
  });

  it('409s without move-in photos and before the move-in phase', async () => {
    await generate(await createMove(1)).expect(409);
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    await generate(id).expect(409);
  });

  it('allows zero issues and moves the phase to report', async () => {
    const id = await moveInMove();
    const res = await generate(id).expect(201);
    expect(res.body.data.snapshot.issues).toEqual([]);
    expect(res.body.data.snapshot.watchList).toHaveLength(5);
    expect((await request(app).get('/api/moves/current')).body.data.phase).toBe('report');
  });

  it('keeps the snapshot unchanged after a finding is edited, and photos can no longer be deleted', async () => {
    const { id, finding } = await comparedMove();
    await request(app).patch(`/api/findings/${finding.id}`).send({ resolution: 'ok' }).expect(200);
    const report = (await generate(id).expect(201)).body.data;
    await request(app).patch(`/api/findings/${finding.id}`).send({ resolution: 'custom', note: 'Changed my mind' }).expect(200);
    expect((await request(app).get(`/api/reports/${report.id}`).expect(200)).body.data.snapshot).toEqual(report.snapshot);
    await request(app).delete(`/api/photos/${finding.moveInPhotos[0].id}`).expect(409);
  });
});

describe('GET reports', () => {
  it('404s for an unknown report, a move with no report, and an unknown move', async () => {
    await request(app).get(`/api/reports/${unknownId}`).expect(404);
    await request(app).get(`/api/moves/${await moveInMove()}/reports/latest`).expect(404);
    await request(app).get(`/api/moves/${unknownId}/reports/latest`).expect(404);
  });

  it('latest returns the newest report', async () => {
    const id = await moveInMove();
    await generate(id).expect(201);
    const second = (await generate(id).expect(201)).body.data;
    expect((await request(app).get(`/api/moves/${id}/reports/latest`).expect(200)).body.data.id).toBe(second.id);
  });
});
