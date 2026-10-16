import type { GuidanceProgress, PrepareGuidance } from '@movemate/contracts';
import { AppError } from '../../shared/errors';
import * as moveService from '../move/move.service';
import * as repository from './guidance.repository';
import { prepareChecklist, prepareTips } from './guidance.templates';

export function getPrepareGuidance(): PrepareGuidance {
  return { checklist: prepareChecklist, tips: prepareTips };
}

export async function listProgress(moveId: string): Promise<GuidanceProgress[]> {
  await moveService.getById(moveId);
  return repository.listByMove(moveId);
}

export async function setProgress(moveId: string, itemKey: string, completed: boolean): Promise<GuidanceProgress> {
  await moveService.getById(moveId);
  if (!prepareChecklist.some((item) => item.key === itemKey)) {
    throw new AppError('not_found', 'Checklist item not found');
  }
  return repository.upsert(moveId, itemKey, completed);
}
