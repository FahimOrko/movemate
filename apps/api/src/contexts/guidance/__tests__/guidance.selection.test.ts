import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, createMove } from '../../inspection/__tests__/helpers';

const unknownId = '00000000-0000-4000-8000-000000000000';
const select = (id: string, category: string, providerKey: string | null) =>
  request(app).put(`/api/moves/${id}/providers/selection/${category}`).send({ providerKey });
const getSelection = async (id: string) => (await request(app).get(`/api/moves/${id}/providers/selection`).expect(200)).body.data;

describe('provider selection', () => {
  it('starts empty', async () => {
    expect(await getSelection(await createMove(1))).toEqual({ electricity: null, internet: null, home_insurance: null });
  });

  it('saves, changes and clears one provider per category, and persists it', async () => {
    const id = await createMove(1);

    await select(id, 'home_insurance', 'insurance-if').expect(200);
    await select(id, 'internet', 'internet-b').expect(200);
    expect(await getSelection(id)).toEqual({ electricity: null, internet: 'internet-b', home_insurance: 'insurance-if' });

    const changed = await select(id, 'home_insurance', 'insurance-c').expect(200);
    expect(changed.body.data.home_insurance).toBe('insurance-c');

    await select(id, 'internet', null).expect(200);
    expect(await getSelection(id)).toEqual({ electricity: null, internet: null, home_insurance: 'insurance-c' });
  });

  it('rejects a provider from another category and an unknown category', async () => {
    const id = await createMove(1);

    await select(id, 'internet', 'insurance-if').expect(404);
    await select(id, 'water', 'internet-a').expect(400);
    expect(await getSelection(id)).toEqual({ electricity: null, internet: null, home_insurance: null });
  });

  it('404s for an unknown move', async () => {
    await request(app).get(`/api/moves/${unknownId}/providers/selection`).expect(404);
    await select(unknownId, 'internet', 'internet-a').expect(404);
  });
});
