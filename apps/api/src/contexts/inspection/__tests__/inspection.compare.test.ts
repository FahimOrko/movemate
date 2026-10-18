import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../shared/errors';
import { completeJson } from '../../../shared/ai/openrouter.client';
import * as moveService from '../../move/move.service';
import * as photosService from '../../photos/photos.service';
import * as service from '../inspection.service';
import { createMove, uploadPhoto } from './helpers';

vi.mock('../../../shared/ai/openrouter.client', () => ({ completeJson: vi.fn() }));
vi.mock('../../move/move.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../move/move.service')>();
  return { ...actual, applyEvent: vi.fn(actual.applyEvent) };
});
const ai = vi.mocked(completeJson);
const applyEvent = vi.mocked(moveService.applyEvent);

type RawFinding = {
  status: 'looks_good' | 'changed' | 'unclear';
  summary?: string;
  confidence?: 'low' | 'medium' | 'high';
  check_number?: number | null;
  before_photo_indexes?: number[];
  move_in_photo_indexes?: number[];
};
const raw = (findings: RawFinding[]) => ({
  findings: findings.map((finding) => ({
    summary: 'A mark may be visible.',
    confidence: 'medium' as const,
    check_number: null,
    before_photo_indexes: [],
    move_in_photo_indexes: [],
    ...finding,
  })),
});

const aiFailure = () => new AppError('ai_failure', 'The AI rate limit was reached.');

// Two before photos and two move-in photos in the kitchen: images 1-2 are BEFORE, 3-4 are MOVE-IN.
async function kitchenMove() {
  const id = await createMove(2);
  await uploadPhoto(id, 'kitchen', 'before');
  await uploadPhoto(id, 'kitchen', 'before');
  await uploadPhoto(id, 'kitchen', 'move_in');
  await uploadPhoto(id, 'kitchen', 'move_in');
  const photos = await photosService.listByStage(id);
  return { id, before: photos.filter((p) => p.stage === 'before'), moveIn: photos.filter((p) => p.stage === 'move_in') };
}

beforeEach(() => {
  ai.mockReset();
  applyEvent.mockClear();
});

describe('runCompare photo index mapping', () => {
  it('sends the numbered prompt and maps indexes to photo ids by stage', async () => {
    const { id, before, moveIn } = await kitchenMove();
    ai.mockResolvedValue(raw([{ status: 'changed', before_photo_indexes: [1], move_in_photo_indexes: [4] }]));

    const result = await service.runCompare(id);

    expect(ai.mock.calls[0]?.[0].text).toContain('Images 1 to 2 are BEFORE photos. Images 3 to 4 are MOVE-IN photos.');
    expect(ai.mock.calls[0]?.[0].images).toHaveLength(4);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.beforePhotos.map((p) => p.id)).toEqual([before[0]?.id]);
    expect(result.findings[0]?.moveInPhotos.map((p) => p.id)).toEqual([moveIn[1]?.id]);
  });

  it('drops out-of-range indexes and repeats, and files a photo under its own stage', async () => {
    const { id, before, moveIn } = await kitchenMove();
    ai.mockResolvedValue(
      raw([{ status: 'unclear', before_photo_indexes: [0, 2, 2, 5, -1, 3], move_in_photo_indexes: [3, 99] }]),
    );

    const [finding] = (await service.runCompare(id)).findings;

    expect(finding?.beforePhotos.map((p) => p.id)).toEqual([before[1]?.id]);
    expect(finding?.moveInPhotos.map((p) => p.id)).toEqual([moveIn[0]?.id]);
  });

  it('maps a check number to the check and drops one out of range', async () => {
    const { id } = await kitchenMove();
    const check = await service.addCheck(id, { room: 'kitchen', text: 'Look at the oven door for gaps when closed' });
    ai.mockResolvedValue(
      raw([
        { status: 'looks_good', check_number: 1 },
        { status: 'unclear', check_number: 7 },
      ]),
    );

    const { findings } = await service.runCompare(id);

    expect(findings.find((f) => f.aiStatus === 'looks_good')).toMatchObject({ roomCheckId: check.id, checkText: check.text });
    expect(findings.find((f) => f.aiStatus === 'unclear')).toMatchObject({ roomCheckId: null, checkText: null });
    expect(ai.mock.calls[0]?.[0].text).toContain('1. Look at the oven door for gaps when closed');
  });

  it('keeps the order the model returned across repeated runs', async () => {
    const { id } = await kitchenMove();
    const returned = Array.from({ length: 6 }, (_, index) => ({ status: 'changed' as const, summary: `Finding ${index}` }));
    ai.mockResolvedValue(raw(returned));

    for (let run = 0; run < 20; run++) {
      const { findings } = await service.runCompare(id);
      expect(findings.map((f) => f.aiSummary)).toEqual(returned.map((f) => f.summary));
    }
  });

  it('orders changed first, drops looks_good without a check, cuts to 8 and shortens long summaries', async () => {
    const { id } = await kitchenMove();
    await service.addCheck(id, { room: 'kitchen', text: 'Look at the sink for chips' });
    ai.mockResolvedValue(
      raw([
        { status: 'looks_good', check_number: 1 },
        { status: 'looks_good', check_number: null },
        { status: 'unclear', summary: 'u'.repeat(400) },
        ...Array.from({ length: 8 }, () => ({ status: 'changed' as const })),
      ]),
    );

    const { findings } = await service.runCompare(id);

    expect(findings).toHaveLength(8);
    expect(findings.every((f) => f.aiStatus === 'changed')).toBe(true);

    ai.mockResolvedValue(raw([{ status: 'unclear', summary: 'u'.repeat(400) }, { status: 'looks_good', check_number: 1 }, { status: 'looks_good' }]));
    const second = (await service.runCompare(id)).findings;
    expect(second.map((f) => f.aiStatus)).toEqual(['unclear', 'looks_good']);
    expect(second[0]?.aiSummary?.length).toBeLessThanOrEqual(300);
  });
});

describe('runCompare guards', () => {
  it('rejects a move that has not reached move-in', async () => {
    const id = await createMove(1);
    await expect(service.runCompare(id)).rejects.toMatchObject({ code: 'invalid_phase_transition' });
  });

  it('409s when no room has both before and move-in photos, without calling the AI', async () => {
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    await uploadPhoto(id, 'bedroom', 'move_in');

    await expect(service.runCompare(id)).rejects.toMatchObject({ code: 'invalid_phase_transition' });
    expect(ai).not.toHaveBeenCalled();
  });

  it('returns rooms with one stage only as skippedRooms', async () => {
    const { id } = await kitchenMove();
    await uploadPhoto(id, 'bedroom', 'before');
    await uploadPhoto(id, 'balcony', 'move_in');
    ai.mockResolvedValue(raw([]));

    const result = await service.runCompare(id);

    expect(result.skippedRooms.sort()).toEqual(['balcony', 'bedroom']);
    expect(ai).toHaveBeenCalledTimes(1);
  });
});

describe('runCompare replacing and failing', () => {
  it('re-running one room replaces only its AI findings', async () => {
    const { id } = await kitchenMove();
    await uploadPhoto(id, 'bedroom', 'before');
    await uploadPhoto(id, 'bedroom', 'move_in');
    ai.mockImplementation(async ({ text }) =>
      raw([{ status: 'unclear', summary: text.startsWith('Room: Kitchen') ? 'old kitchen' : 'bedroom stays' }]),
    );
    await service.runCompare(id);
    await service.addFinding(id, { room: 'kitchen', note: 'my own note' });

    ai.mockImplementation(async () => raw([{ status: 'changed', summary: 'new kitchen' }]));
    const { findings } = await service.runCompare(id, ['kitchen']);

    expect(findings.map((f) => f.aiSummary ?? f.userNote).sort()).toEqual(['bedroom stays', 'my own note', 'new kitchen']);
  });

  it('keeps the rooms that worked, reports the failed ones and raises the event', async () => {
    const { id } = await kitchenMove();
    await uploadPhoto(id, 'bedroom', 'before');
    await uploadPhoto(id, 'bedroom', 'move_in');
    ai.mockImplementation(async ({ text }) => {
      if (text.startsWith('Room: Bedroom')) throw aiFailure();
      return raw([{ status: 'unclear' }]);
    });

    const result = await service.runCompare(id);

    expect(result.failedRooms).toEqual(['bedroom']);
    expect(result.findings.map((f) => f.room)).toEqual(['kitchen']);
    expect(applyEvent).toHaveBeenCalledWith(id, 'MoveInCompared');
  });

  it('throws the AI failure, changes nothing and raises no event when every room fails', async () => {
    const { id } = await kitchenMove();
    ai.mockResolvedValueOnce(raw([{ status: 'unclear', summary: 'kept' }]));
    await service.runCompare(id);
    applyEvent.mockClear();
    ai.mockImplementation(async () => {
      throw aiFailure();
    });

    await expect(service.runCompare(id)).rejects.toMatchObject({ code: 'ai_failure' });

    expect((await service.listFindings(id)).map((f) => f.aiSummary)).toEqual(['kept']);
    expect(applyEvent).not.toHaveBeenCalled();
  });

  it('stops at once when AI is not configured', async () => {
    const { id } = await kitchenMove();
    ai.mockImplementation(async () => {
      throw new AppError('ai_not_configured', 'AI is not configured.');
    });
    await expect(service.runCompare(id)).rejects.toMatchObject({ code: 'ai_not_configured' });
  });

  it('nulls room_check_id when the check is deleted', async () => {
    const { id } = await kitchenMove();
    const check = await service.addCheck(id, { room: 'kitchen', text: 'Look at the tap for drips' });
    ai.mockResolvedValue(raw([{ status: 'looks_good', check_number: 1 }]));
    await service.runCompare(id);

    await service.deleteCheck(check.id);

    expect((await service.listFindings(id))[0]).toMatchObject({ roomCheckId: null, checkText: null });
  });
});

describe('runCompare and photos attached to user findings', () => {
  it('skips them and still takes the first 4 of the other move-in photos', async () => {
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    const moveInIds: string[] = [];
    for (let i = 0; i < 6; i++) moveInIds.push(await uploadPhoto(id, 'kitchen', 'move_in'));
    await service.addFinding(id, { room: 'kitchen', note: 'Close-up of a chip', photoIds: [moveInIds[0] ?? '', moveInIds[2] ?? ''] });
    ai.mockResolvedValue(raw([{ status: 'changed', move_in_photo_indexes: [2, 5] }]));

    const result = await service.runCompare(id);

    expect(ai.mock.calls[0]?.[0].images).toHaveLength(5);
    expect(ai.mock.calls[0]?.[0].text).toContain('Image 1 is the BEFORE photo. Images 2 to 5 are MOVE-IN photos.');
    const aiFinding = result.findings.find((f) => f.source === 'ai');
    expect(aiFinding?.moveInPhotos.map((p) => p.id)).toEqual([moveInIds[1], moveInIds[5]]);
  });

  it('skips a room whose only move-in photo is attached to a user finding', async () => {
    const id = await createMove(2);
    await uploadPhoto(id, 'kitchen', 'before');
    await uploadPhoto(id, 'bedroom', 'before');
    const detail = await uploadPhoto(id, 'kitchen', 'move_in');
    await uploadPhoto(id, 'bedroom', 'move_in');
    await service.addFinding(id, { room: 'kitchen', note: 'Close-up', photoIds: [detail] });
    ai.mockResolvedValue(raw([]));

    const result = await service.runCompare(id);

    expect(ai).toHaveBeenCalledTimes(1);
    expect(result.skippedRooms).toEqual(['kitchen']);
  });
});
