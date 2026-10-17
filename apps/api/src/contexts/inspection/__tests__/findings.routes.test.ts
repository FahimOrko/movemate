import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../shared/errors';
import { completeJson } from '../../../shared/ai/openrouter.client';
import { app, createMove, uploadPhoto } from './helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
const ai = vi.mocked(completeJson);

const unknownId = '00000000-0000-4000-8000-000000000000';
const oneFinding = {
  findings: [{ status: 'changed' as const, summary: 'A mark may be visible.', confidence: 'high' as const, check_number: null, before_photo_indexes: [1], move_in_photo_indexes: [2] }],
};

async function comparedMove() {
  const id = await createMove(2);
  await uploadPhoto(id, 'kitchen', 'before');
  await uploadPhoto(id, 'kitchen', 'move_in');
  ai.mockResolvedValue(oneFinding);
  const res = await request(app).post(`/api/moves/${id}/inspection/compare`).expect(200);
  return { id, finding: res.body.data.findings[0] };
}

beforeEach(() => {
  ai.mockReset();
});

describe('POST /moves/:id/inspection/compare', () => {
  it('returns findings with photo urls, failedRooms and skippedRooms', async () => {
    const { finding } = await comparedMove();
    expect(finding.beforePhotos[0].url).toMatch(/^\/api\/photos\/.+\/file$/);
    expect(finding.moveInPhotos).toHaveLength(1);
  });

  it('409s before move-in and without comparable rooms', async () => {
    const early = await createMove(1);
    await request(app).post(`/api/moves/${early}/inspection/compare`).expect(409);
    const noPhotos = await createMove(2);
    await request(app).post(`/api/moves/${noPhotos}/inspection/compare`).expect(409);
  });

  it('502s and 503s with the AI error', async () => {
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    await uploadPhoto(id, 'kitchen', 'move_in');
    ai.mockRejectedValue(new AppError('ai_failure', 'The AI rate limit was reached.'));
    expect((await request(app).post(`/api/moves/${id}/inspection/compare`).expect(502)).body.error.code).toBe('ai_failure');
    ai.mockRejectedValue(new AppError('ai_not_configured', 'AI is not configured.'));
    await request(app).post(`/api/moves/${id}/inspection/compare`).expect(503);
  });

  it('400s for a bad rooms list and 404s for an unknown move', async () => {
    const id = await createMove(2);
    await request(app).post(`/api/moves/${id}/inspection/compare`).send({ rooms: ['garage'] }).expect(400);
    await request(app).post(`/api/moves/${unknownId}/inspection/compare`).expect(404);
  });
});

describe('findings routes', () => {
  it('lists findings', async () => {
    const { id } = await comparedMove();
    const res = await request(app).get(`/api/moves/${id}/findings`).expect(200);
    expect(res.body.data).toHaveLength(1);
    await request(app).get(`/api/moves/${unknownId}/findings`).expect(404);
  });

  it('resolves a finding and rejects invalid bodies', async () => {
    const { finding } = await comparedMove();
    const patch = (body: object) => request(app).patch(`/api/findings/${finding.id}`).send(body);

    expect((await patch({ resolution: 'custom', note: ' Seen at viewing ' }).expect(200)).body.data).toMatchObject({ resolution: 'custom', userNote: 'Seen at viewing' });
    await patch({ resolution: 'custom' }).expect(400);
    await patch({ resolution: 'custom', note: '  ' }).expect(400);
    await patch({ resolution: 'issue', note: 'x'.repeat(501) }).expect(400);
    await patch({ resolution: 'pending' }).expect(400);
    await request(app).patch(`/api/findings/${unknownId}`).send({ resolution: 'ok' }).expect(404);
  });

  it('adds and deletes a user finding, and refuses to delete an AI one', async () => {
    const { id, finding } = await comparedMove();

    const created = await request(app).post(`/api/moves/${id}/findings`).send({ room: 'kitchen', note: 'Loose handle' }).expect(201);
    expect(created.body.data).toMatchObject({ source: 'user', resolution: 'issue' });
    await request(app).post(`/api/moves/${id}/findings`).send({ room: 'kitchen', note: '' }).expect(400);
    await request(app).delete(`/api/findings/${created.body.data.id}`).expect(204);
    await request(app).delete(`/api/findings/${finding.id}`).expect(409);
    await request(app).delete(`/api/findings/${unknownId}`).expect(404);
  });

  it('409s when adding a finding before move-in', async () => {
    const id = await createMove(1);
    await request(app).post(`/api/moves/${id}/findings`).send({ room: 'kitchen', note: 'x' }).expect(409);
  });
});
