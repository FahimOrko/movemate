import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeJson } from '../../../shared/ai/openrouter.client';
import { app, createMove, uploadPhoto } from '../../inspection/__tests__/helpers';
import { insertReport } from '../report.repository';

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
    const [room] = res.body.data.snapshot.rooms;
    expect(res.body.data.snapshot.version).toBe(2);
    expect(room.problems).toHaveLength(1);
    expect(room.problems[0]).toMatchObject({ source: 'ai', resolution: 'issue', note: 'Scratch' });
    expect(room.problems[0].beforePhotos[0].url).toMatch(/^\/api\/photos\/.+\/file$/);
    expect(room.beforePhotos).toHaveLength(1);
    expect(room.moveInPhotos).toHaveLength(1);
  });

  it('is not blocked by unanswered room checks, and lists them as Not checked', async () => {
    const id = await moveInMove();
    await request(app).post(`/api/moves/${id}/room-checks`).send({ room: 'kitchen', text: 'Look at the oven' }).expect(201);
    const res = await generate(id).expect(201);
    expect(res.body.data.snapshot.rooms[0].checks).toMatchObject([{ text: 'Look at the oven', status: 'pending' }]);
  });

  it('records problems from a room check and from the user, and answers on the checks', async () => {
    const id = await moveInMove();
    const photoId = await uploadPhoto(id, 'kitchen', 'move_in');
    const check = (await request(app).post(`/api/moves/${id}/room-checks`).send({ room: 'kitchen', text: 'Look at the oven' }).expect(201)).body.data;
    await request(app).patch(`/api/room-checks/${check.id}`).send({ status: 'problem', note: 'Cracked glass', photoIds: [photoId] }).expect(200);
    await request(app).post(`/api/moves/${id}/findings`).send({ room: 'bathroom', note: 'Loose tile' }).expect(201);
    const { rooms } = (await generate(id).expect(201)).body.data.snapshot;
    expect(rooms.map((room: { room: string }) => room.room)).toEqual(['kitchen', 'bathroom']);
    expect(rooms[0].checks[0].status).toBe('problem');
    expect(rooms[0].problems[0]).toMatchObject({ source: 'room_check', checkText: 'Look at the oven', note: 'Cracked glass' });
    expect(rooms[0].problems[0].moveInPhotos).toHaveLength(1);
    expect(rooms[1].problems[0]).toMatchObject({ source: 'user', note: 'Loose tile' });
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
    expect(res.body.data.snapshot.rooms.flatMap((room: { problems: unknown[] }) => room.problems)).toEqual([]);
    expect(res.body.data.snapshot.watchList).toHaveLength(5);
    expect((await request(app).get('/api/moves/current')).body.data.phase).toBe('report');
  });

  it('keeps the snapshot unchanged after a finding is edited, and photos can no longer be deleted', async () => {
    const { id, finding } = await comparedMove();
    await request(app).patch(`/api/findings/${finding.id}`).send({ resolution: 'ok' }).expect(200);
    const report = (await generate(id).expect(201)).body.data;
    await request(app).patch(`/api/findings/${finding.id}`).send({ resolution: 'custom', note: 'Changed my mind' }).expect(200);
    await request(app).post(`/api/moves/${id}/room-checks`).send({ room: 'kitchen', text: 'Look at the oven' }).expect(201);
    expect((await request(app).get(`/api/reports/${report.id}`).expect(200)).body.data.snapshot).toEqual(report.snapshot);
    await request(app).delete(`/api/photos/${finding.moveInPhotos[0].id}`).expect(409);
  });
});

describe('old snapshots', () => {
  it('409s report_outdated for a report saved before the version bump, and POST still works', async () => {
    const id = await moveInMove();
    const old = await insertReport(id, { move: { address: 'x', moveDate: null }, generatedAt: '2026-01-01T00:00:00.000Z', issues: [], findingsByRoom: [], watchList: [], disclaimer: 'd' });
    for (const url of [`/api/reports/${old.id}`, `/api/moves/${id}/reports/latest`, `/api/moves/${id}/summary`]) {
      const res = await request(app).get(url).expect(409);
      expect(res.body.error).toEqual({ code: 'report_outdated', message: 'Regenerate this report' });
    }
    const fresh = (await generate(id).expect(201)).body.data;
    expect((await request(app).get(`/api/moves/${id}/reports/latest`).expect(200)).body.data.id).toBe(fresh.id);
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
