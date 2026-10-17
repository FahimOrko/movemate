import { isHandled, type ChecklistStatus } from '@movemate/contracts';
import { describe, expect, it } from 'vitest';
import * as moveService from '../../move/move.service';
import * as service from '../guidance.service';

describe('guidance service', () => {
  it('keeps one row per item however often it is set', async () => {
    const move = await moveService.create({ address: 'Aurakatu 12' });

    await service.setProgress(move.id, 'sign-lease', 'done');
    await service.setProgress(move.id, 'sign-lease', 'no');
    await service.setProgress(move.id, 'sign-lease', 'na');

    const list = await service.listProgress(move.id);
    expect(list.filter((item) => item.status !== 'pending')).toEqual([expect.objectContaining({ key: 'sign-lease', status: 'na' })]);
  });

  it('rejects an unknown item key and an unknown move', async () => {
    const move = await moveService.create({ address: 'Aurakatu 12' });

    await expect(service.setProgress(move.id, 'nope', 'done')).rejects.toMatchObject({ code: 'not_found' });
    await expect(
      service.setProgress('00000000-0000-4000-8000-000000000000', 'sign-lease', 'done'),
    ).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('isHandled', () => {
  it('counts done and na only', () => {
    const statuses: ChecklistStatus[] = ['pending', 'done', 'no', 'na', 'done'];

    expect(statuses.filter(isHandled)).toHaveLength(3);
    expect(statuses.map(isHandled)).toEqual([false, true, false, true, true]);
  });
});
