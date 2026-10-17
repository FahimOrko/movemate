import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeJson } from '../../../shared/ai/openrouter.client';
import * as moveService from '../../move/move.service';
import * as service from '../inspection.service';
import { createMove, uploadPhoto } from './helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
vi.mock('../../move/move.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../move/move.service')>();
  return { ...actual, applyEvent: vi.fn(actual.applyEvent) };
});
const ai = vi.mocked(completeJson);
const applyEvent = vi.mocked(moveService.applyEvent);

const unknownId = '00000000-0000-4000-8000-000000000000';

async function moveWithAiFinding() {
  const id = await createMove(2);
  await uploadPhoto(id, 'kitchen', 'before');
  await uploadPhoto(id, 'kitchen', 'move_in');
  ai.mockResolvedValue({
    findings: [{ status: 'changed', summary: 'A mark may be visible.', confidence: 'high', check_number: null, before_photo_indexes: [1], move_in_photo_indexes: [2] }],
  });
  const [finding] = (await service.runCompare(id)).findings;
  if (!finding) throw new Error('No finding');
  applyEvent.mockClear();
  return { id, finding };
}

beforeEach(() => {
  ai.mockReset();
  applyEvent.mockClear();
});

describe('resolveFinding', () => {
  it('starts pending and resolves ok, which clears the note', async () => {
    const { finding } = await moveWithAiFinding();
    expect(finding.resolution).toBe('pending');
    await service.resolveFinding(finding.id, { resolution: 'issue', note: 'stain' });

    const ok = await service.resolveFinding(finding.id, { resolution: 'ok' });

    expect(ok).toMatchObject({ resolution: 'ok', userNote: null });
  });

  it('keeps the note on issue without a new one and takes a custom note', async () => {
    const { finding } = await moveWithAiFinding();
    await service.resolveFinding(finding.id, { resolution: 'custom', note: 'was there at the viewing' });

    expect(await service.resolveFinding(finding.id, { resolution: 'issue' })).toMatchObject({
      resolution: 'issue',
      userNote: 'was there at the viewing',
    });
    expect(await service.resolveFinding(finding.id, { resolution: 'issue', note: 'new note' })).toMatchObject({ userNote: 'new note' });
  });

  it('sets updated_at and raises FindingResolved', async () => {
    const { id, finding } = await moveWithAiFinding();

    const resolved = await service.resolveFinding(finding.id, { resolution: 'ok' });

    expect(new Date(resolved.updatedAt).getTime()).toBeGreaterThan(new Date(finding.updatedAt).getTime());
    expect(applyEvent).toHaveBeenCalledWith(id, 'FindingResolved');
  });

  it('404s for an unknown finding', async () => {
    await expect(service.resolveFinding(unknownId, { resolution: 'ok' })).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('user findings', () => {
  it('adds an issue the user wrote and deletes it', async () => {
    const id = await createMove(2);

    const finding = await service.addFinding(id, { room: 'hallway', note: 'Scratch by the door' });

    expect(finding).toMatchObject({ source: 'user', resolution: 'issue', userNote: 'Scratch by the door', aiStatus: null, aiSummary: null, confidence: null });
    await service.deleteFinding(finding.id);
    expect(await service.listFindings(id)).toEqual([]);
  });

  it('refuses to add before move-in', async () => {
    const id = await createMove(1);
    await expect(service.addFinding(id, { room: 'hallway', note: 'x' })).rejects.toMatchObject({ code: 'invalid_phase_transition' });
  });

  it('409s when deleting an AI finding and 404s for an unknown one', async () => {
    const { finding } = await moveWithAiFinding();
    await expect(service.deleteFinding(finding.id)).rejects.toMatchObject({ code: 'invalid_phase_transition' });
    await expect(service.deleteFinding(unknownId)).rejects.toMatchObject({ code: 'not_found' });
  });
});
