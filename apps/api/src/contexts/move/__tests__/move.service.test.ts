import { describe, expect, it } from 'vitest';
import { db } from '../../../db/client';
import { moves } from '../../../db/schema/move';
import { eq } from 'drizzle-orm';
import * as service from '../move.service';

async function moveInPhase(phase: 'before_photos' | 'move_in' | 'report' | 'settle_in') {
  const move = await service.create({ address: 'Aurakatu 12, Turku' });
  await db.update(moves).set({ phase }).where(eq(moves.id, move.id));
  return move;
}

describe('move service', () => {
  it('creates a move in the prepare phase', async () => {
    const move = await service.create({ address: 'Aurakatu 12, Turku', moveDate: '2026-11-01' });

    expect(move).toMatchObject({ address: 'Aurakatu 12, Turku', moveDate: '2026-11-01', phase: 'prepare' });
  });

  it('returns null when there is no move, otherwise the latest', async () => {
    expect(await service.getCurrent()).toBeNull();

    await service.create({ address: 'First' });
    const second = await service.create({ address: 'Second' });

    expect((await service.getCurrent())?.id).toBe(second.id);
  });

  it('throws not_found for an unknown id', async () => {
    await expect(service.getById('00000000-0000-4000-8000-000000000000')).rejects.toMatchObject({
      code: 'not_found',
    });
  });

  it('advances from prepare and before_photos', async () => {
    const move = await service.create({ address: 'Aurakatu 12' });

    expect((await service.advance(move.id)).phase).toBe('before_photos');
    expect((await service.advance(move.id)).phase).toBe('move_in');
  });

  it('advances from report to settle_in', async () => {
    const move = await moveInPhase('report');

    expect((await service.advance(move.id)).phase).toBe('settle_in');
  });

  it('refuses to advance from move_in and settle_in', async () => {
    const inMoveIn = await moveInPhase('move_in');
    const inSettleIn = await moveInPhase('settle_in');

    await expect(service.advance(inMoveIn.id)).rejects.toMatchObject({
      code: 'invalid_phase_transition',
      message: 'Generate the report to continue',
    });
    await expect(service.advance(inSettleIn.id)).rejects.toMatchObject({ code: 'invalid_phase_transition' });
  });

  it('applyEvent never moves the phase backwards', async () => {
    const move = await moveInPhase('before_photos');

    expect((await service.applyEvent(move.id, 'MoveCreated')).phase).toBe('before_photos');
  });

  it('assertPhaseReached passes for reached phases and rejects locked ones', async () => {
    const move = await moveInPhase('before_photos');

    await expect(service.assertPhaseReached(move.id, 'prepare')).resolves.toBeUndefined();
    await expect(service.assertPhaseReached(move.id, 'move_in')).rejects.toMatchObject({
      code: 'invalid_phase_transition',
    });
  });
});
