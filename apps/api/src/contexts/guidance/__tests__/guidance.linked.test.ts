import { countOpenPrepare, linkedItemKeys, type ChecklistStatus, type Phase } from '@movemate/contracts';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db } from '../../../db/client';
import * as moveService from '../../move/move.service';
import * as service from '../guidance.service';
import { prepareChecklist } from '../guidance.templates';

const electricity = linkedItemKeys.electricity;

// Raw SQL: the moves table belongs to the move context, and the only way to jump phases is its events.
async function setPhase(moveId: string, phase: Phase) {
  await db.execute(sql`update moves set phase = ${phase} where id = ${moveId}`);
}

async function moveAt(phase: Phase) {
  const move = await moveService.create({ address: 'Aurakatu 12' });
  await setPhase(move.id, phase);
  return move.id;
}

async function statusOf(moveId: string, key: string): Promise<ChecklistStatus | undefined> {
  return (await service.listProgress(moveId)).find((item) => item.key === key)?.status;
}

describe('linked checklist items', () => {
  it('links exactly the three provider items, keeping the two existing keys', () => {
    const linked = prepareChecklist.filter((item) => item.linkedCategory);

    expect(linked.map((item) => [item.key, item.linkedCategory])).toEqual([
      ['set-up-electricity', 'electricity'],
      ['set-up-internet', 'internet'],
      ['get-home-insurance', 'home_insurance'],
    ]);
    expect(linked.every((item) => item.category === 'Settle in')).toBe(true);
  });

  it('locks linked items before settle_in only', async () => {
    for (const phase of ['prepare', 'report'] as const) {
      const list = await service.listProgress(await moveAt(phase));
      expect(list.filter((item) => item.locked).map((item) => item.key)).toEqual(Object.values(linkedItemKeys));
    }
    const unlocked = await service.listProgress(await moveAt('settle_in'));
    expect(unlocked.some((item) => item.locked)).toBe(false);
  });

  it('rejects answering a locked item with 409, and accepts it after settle_in', async () => {
    const early = await moveAt('report');
    await expect(service.setProgress(early, electricity, 'done')).rejects.toMatchObject({
      code: 'invalid_phase_transition',
      message: 'Available once you reach Settle in',
    });
    await expect(service.setProgress(early, 'sign-lease', 'done')).resolves.toMatchObject({ status: 'done' });

    const later = await moveAt('settle_in');
    await expect(service.setProgress(later, electricity, 'na')).resolves.toMatchObject({ status: 'na', locked: false });
  });

  it('keeps a saved answer for an existing key visible while locked', async () => {
    const id = await moveAt('settle_in');
    await service.setProgress(id, electricity, 'no');
    await setPhase(id, 'report');

    const item = (await service.listProgress(id)).find((entry) => entry.key === electricity);
    expect(item).toMatchObject({ status: 'no', locked: true });
  });

  it('sets the item done when a provider is saved, and shows the provider name', async () => {
    const id = await moveAt('settle_in');

    await service.setSelection(id, 'electricity', 'electricity-b');

    const item = (await service.listProgress(id)).find((entry) => entry.key === electricity);
    expect(item).toMatchObject({ status: 'done', providerName: 'Electricity Provider B' });
  });

  it('resets to pending on clear only when the item is done', async () => {
    const id = await moveAt('settle_in');
    await service.setSelection(id, 'electricity', 'electricity-a');
    await service.setSelection(id, 'electricity', null);
    expect(await statusOf(id, electricity)).toBe('pending');

    await service.setSelection(id, 'internet', 'internet-a');
    await service.setProgress(id, linkedItemKeys.internet, 'no');
    await service.setSelection(id, 'internet', null);
    expect(await statusOf(id, linkedItemKeys.internet)).toBe('no');
  });

  it('lets a manual N/A win over selecting and clearing a provider', async () => {
    const id = await moveAt('settle_in');
    await service.setProgress(id, electricity, 'na');

    await service.setSelection(id, 'electricity', 'electricity-a');
    expect(await statusOf(id, electricity)).toBe('na');
    expect((await service.getSelection(id)).electricity).toBe('electricity-a');

    await service.setSelection(id, 'electricity', null);
    expect(await statusOf(id, electricity)).toBe('na');
  });
});

describe('countOpenPrepare', () => {
  it('ignores linked items, so Prepare completes without them', async () => {
    const id = await moveAt('report');
    const items = await service.listProgress(id);
    for (const item of items.filter((entry) => !entry.linkedCategory)) await service.setProgress(id, item.key, 'done');

    const list = await service.listProgress(id);
    expect(list.filter((item) => item.status === 'pending')).toHaveLength(3);
    expect(countOpenPrepare(list)).toBe(0);
  });
});
