import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeJson } from '../../../shared/ai/openrouter.client';
import { app, createMove, uploadPhoto } from './helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
const ai = vi.mocked(completeJson);

const unknownId = '00000000-0000-4000-8000-000000000000';

async function addCheck(moveId: string, room = 'kitchen') {
  return (await request(app).post(`/api/moves/${moveId}/room-checks`).send({ room, text: 'Check the oven door' }).expect(201)).body.data;
}
const answer = (checkId: string, body: object) => request(app).patch(`/api/room-checks/${checkId}`).send(body);
const findings = async (moveId: string) => (await request(app).get(`/api/moves/${moveId}/findings`).expect(200)).body.data;
const checks = async (moveId: string) => (await request(app).get(`/api/moves/${moveId}/room-checks`).expect(200)).body.data;

beforeEach(() => {
  ai.mockReset();
});

describe('PATCH /room-checks/:id', () => {
  it('sets pending, ok and na', async () => {
    const id = await createMove(2);
    const check = await addCheck(id);
    for (const status of ['ok', 'na', 'pending']) {
      const res = await answer(check.id, { status }).expect(200);
      expect(res.body.data).toMatchObject({ id: check.id, status, problem: null });
    }
  });

  it('requires a note for a problem', async () => {
    const id = await createMove(2);
    const check = await addCheck(id);
    await answer(check.id, { status: 'problem' }).expect(400);
    await answer(check.id, { status: 'problem', note: '  ' }).expect(400);
    await answer(check.id, { status: 'problem', note: 'x'.repeat(501) }).expect(400);
  });

  it('creates one linked finding, then updates the same one', async () => {
    const id = await createMove(2);
    const check = await addCheck(id);
    const first = await uploadPhoto(id, 'kitchen', 'move_in');
    const second = await uploadPhoto(id, 'kitchen', 'move_in');

    const created = await answer(check.id, { status: 'problem', note: 'Door sticks', photoIds: [first] }).expect(200);
    const updated = await answer(check.id, { status: 'problem', note: 'Door sticks badly', photoIds: [second] }).expect(200);

    const all = await findings(id);
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ source: 'user', resolution: 'issue', userNote: 'Door sticks badly', roomCheckId: check.id });
    expect(all[0].moveInPhotos.map((p: { id: string }) => p.id)).toEqual([second]);
    expect(updated.body.data.problem).toMatchObject({ findingId: created.body.data.problem.findingId, note: 'Door sticks badly' });
    expect(updated.body.data.problem.photos[0].url).toMatch(/^\/api\/photos\/.+\/file$/);
  });

  it('removes only the user finding when the answer leaves problem', async () => {
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    await uploadPhoto(id, 'kitchen', 'move_in');
    const check = await addCheck(id);
    ai.mockResolvedValue({
      findings: [{ status: 'unclear', summary: 'Maybe.', confidence: 'low', check_number: 1, before_photo_indexes: [1], move_in_photo_indexes: [2] }],
    });
    await request(app).post(`/api/moves/${id}/inspection/compare`).expect(200);
    await answer(check.id, { status: 'problem', note: 'Door sticks' }).expect(200);
    expect(await findings(id)).toHaveLength(2);

    await answer(check.id, { status: 'ok' }).expect(200);

    const left = await findings(id);
    expect(left).toHaveLength(1);
    expect(left[0]).toMatchObject({ source: 'ai', roomCheckId: check.id });
  });

  it('409s below move-in and 404s for an unknown check', async () => {
    const early = await createMove(1);
    const check = await addCheck(early);
    await answer(check.id, { status: 'ok' }).expect(409);
    await answer(unknownId, { status: 'ok' }).expect(404);
  });

  it('keeps the finding as a standalone issue when the check is deleted', async () => {
    const id = await createMove(2);
    const check = await addCheck(id);
    await answer(check.id, { status: 'problem', note: 'Door sticks' }).expect(200);

    await request(app).delete(`/api/room-checks/${check.id}`).expect(204);

    const all = await findings(id);
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ roomCheckId: null, userNote: 'Door sticks' });
    await request(app).delete(`/api/findings/${all[0].id}`).expect(204);
  });

  it('rejects photos from another move, another stage, another room, or more than 3', async () => {
    const id = await createMove(2);
    const other = await createMove(2);
    const check = await addCheck(id);
    const foreign = await uploadPhoto(other, 'kitchen', 'move_in');
    const beforePhoto = await uploadPhoto(id, 'kitchen', 'before');
    const bedroom = await uploadPhoto(id, 'bedroom', 'move_in');
    const four = [await uploadPhoto(id, 'kitchen', 'move_in'), await uploadPhoto(id, 'kitchen', 'move_in'), await uploadPhoto(id, 'kitchen', 'move_in'), await uploadPhoto(id, 'kitchen', 'move_in')];

    for (const photoIds of [[foreign], [beforePhoto], [bedroom], [unknownId], four]) {
      await answer(check.id, { status: 'problem', note: 'x', photoIds }).expect(400);
    }
    expect(await findings(id)).toHaveLength(0);
  });

  it('lists status and the problem with its photo urls', async () => {
    const id = await createMove(2);
    const check = await addCheck(id);
    const photo = await uploadPhoto(id, 'kitchen', 'move_in');
    await answer(check.id, { status: 'problem', note: 'Door sticks', photoIds: [photo] }).expect(200);

    const [listed] = await checks(id);

    expect(listed).toMatchObject({ status: 'problem', problem: { note: 'Door sticks' } });
    expect(listed.problem.photos.map((p: { id: string }) => p.id)).toEqual([photo]);
  });

  it('keeps answering a check-linked finding on the check', async () => {
    const id = await createMove(2);
    const check = await addCheck(id);
    await answer(check.id, { status: 'problem', note: 'Door sticks' }).expect(200);
    const [finding] = await findings(id);

    await request(app).patch(`/api/findings/${finding.id}`).send({ resolution: 'ok' }).expect(409);
    await request(app).delete(`/api/findings/${finding.id}`).expect(409);
  });
});
