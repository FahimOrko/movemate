import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../shared/errors';
import { completeJson } from '../../../shared/ai/openrouter.client';
import * as moveService from '../../move/move.service';
import * as service from '../inspection.service';
import { createMove, uploadBefore } from './helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
const ai = vi.mocked(completeJson);

const aiFailure = () => new AppError('ai_failure', 'The AI rate limit was reached.');
const texts = (checks: { text: string }[]) => checks.map((check) => check.text);

beforeEach(() => {
  ai.mockReset();
});

describe('runBaseline', () => {
  it('saves the checks per room and unlocks move-in', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockResolvedValue({ checks: ['Check whether the counter is chipped'] });

    const result = await service.runBaseline(id);

    expect(result.failedRooms).toEqual([]);
    expect(result.checks).toMatchObject([{ room: 'kitchen', source: 'ai', text: 'Check whether the counter is chipped' }]);
    expect((await moveService.getById(id)).phase).toBe('move_in');
  });

  it('makes one call per room with at most 4 images each', async () => {
    const id = await createMove();
    for (let i = 0; i < 4; i++) await uploadBefore(id, 'kitchen');
    await uploadBefore(id, 'bedroom');
    ai.mockResolvedValue({ checks: [] });

    await service.runBaseline(id);

    expect(ai).toHaveBeenCalledTimes(2);
    expect(ai.mock.calls.map(([call]) => call.images.length).sort()).toEqual([1, 4]);
  });

  it('keeps only the first 8 checks', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockResolvedValue({ checks: Array.from({ length: 11 }, (_, i) => `Check whether ${i}`) });
    expect((await service.runBaseline(id)).checks).toHaveLength(8);
  });

  it('replaces AI checks on a rerun and keeps the user checks', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockResolvedValueOnce({ checks: ['old ai'] }).mockResolvedValueOnce({ checks: ['new ai'] });
    await service.runBaseline(id);
    await service.addCheck(id, { room: 'kitchen', text: 'my own check' });

    const result = await service.runBaseline(id);

    expect(texts(result.checks).sort()).toEqual(['my own check', 'new ai']);
  });

  it('keeps the rooms that worked, reports the failed ones and raises no event', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    await uploadBefore(id, 'bedroom');
    ai.mockImplementation(async ({ text }) => {
      if (text.startsWith('Room: Bedroom')) throw aiFailure();
      return { checks: ['kitchen check'] };
    });

    const result = await service.runBaseline(id);

    expect(result.failedRooms).toEqual(['bedroom']);
    expect(texts(result.checks)).toEqual(['kitchen check']);
    expect((await moveService.getById(id)).phase).toBe('before_photos');
  });

  it('retries only the requested rooms', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    await uploadBefore(id, 'bedroom');
    ai.mockResolvedValue({ checks: [] });
    await service.runBaseline(id, ['bedroom']);
    expect(ai).toHaveBeenCalledTimes(1);
  });

  it('throws the AI failure and leaves old checks alone when every room fails', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    ai.mockResolvedValueOnce({ checks: ['kept'] });
    await service.runBaseline(id);
    ai.mockImplementation(async () => {
      throw aiFailure();
    });

    await expect(service.runBaseline(id)).rejects.toMatchObject({ code: 'ai_failure' });
    expect(texts(await service.listChecks(id))).toEqual(['kept']);
  });

  it('stops at once when AI is not configured', async () => {
    const id = await createMove();
    await uploadBefore(id, 'kitchen');
    await uploadBefore(id, 'bedroom');
    ai.mockImplementation(async () => {
      throw new AppError('ai_not_configured', 'AI is not configured.');
    });

    await expect(service.runBaseline(id)).rejects.toMatchObject({ code: 'ai_not_configured' });
    expect(ai).toHaveBeenCalledTimes(1);
  });

  it('rejects a move without before photos', async () => {
    const id = await createMove();
    await expect(service.runBaseline(id)).rejects.toMatchObject({ code: 'invalid_phase_transition' });
    expect(ai).not.toHaveBeenCalled();
  });

  it('rejects a move that has not reached before photos', async () => {
    const id = await createMove(0);
    await expect(service.runBaseline(id)).rejects.toMatchObject({ code: 'invalid_phase_transition' });
  });
});

describe('user checks', () => {
  it('adds and deletes a check', async () => {
    const id = await createMove();
    const check = await service.addCheck(id, { room: 'hallway', text: 'Look at the door lock' });
    expect(check.source).toBe('user');
    await service.deleteCheck(check.id);
    expect(await service.listChecks(id)).toEqual([]);
  });

  it('404s when deleting an unknown check', async () => {
    await expect(service.deleteCheck('00000000-0000-4000-8000-000000000000')).rejects.toMatchObject({ code: 'not_found' });
  });
});
