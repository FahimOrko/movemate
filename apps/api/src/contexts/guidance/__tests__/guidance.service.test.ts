import { describe, expect, it } from 'vitest';
import * as moveService from '../../move/move.service';
import * as service from '../guidance.service';

describe('guidance service', () => {
  it('keeps one row per item however often it is set', async () => {
    const move = await moveService.create({ address: 'Aurakatu 12' });

    await service.setProgress(move.id, 'sign-lease', true);
    await service.setProgress(move.id, 'sign-lease', false);
    await service.setProgress(move.id, 'sign-lease', true);

    expect(await service.listProgress(move.id)).toEqual([{ itemKey: 'sign-lease', completed: true }]);
  });

  it('rejects an unknown item key and an unknown move', async () => {
    const move = await moveService.create({ address: 'Aurakatu 12' });

    await expect(service.setProgress(move.id, 'nope', true)).rejects.toMatchObject({ code: 'not_found' });
    await expect(
      service.setProgress('00000000-0000-4000-8000-000000000000', 'sign-lease', true),
    ).rejects.toMatchObject({ code: 'not_found' });
  });
});
