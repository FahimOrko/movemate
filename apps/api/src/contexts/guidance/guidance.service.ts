import type { GuidanceProgress, PrepareGuidance, SettleInGuidance } from '@movemate/contracts';
import { env } from '../../env';
import { AppError } from '../../shared/errors';
import * as moveService from '../move/move.service';
import * as repository from './guidance.repository';
import { insuranceExplainer, prepareChecklist, prepareTips, providerTemplates } from './guidance.templates';

export function getPrepareGuidance(): PrepareGuidance {
  return { checklist: prepareChecklist, tips: prepareTips };
}

export function getProviders(): SettleInGuidance {
  const providers = providerTemplates.map((provider) => ({
    ...provider,
    url: provider.highlighted ? (env.IF_INSURANCE_URL ?? null) : null,
  }));
  return { explainer: insuranceExplainer, providers };
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
