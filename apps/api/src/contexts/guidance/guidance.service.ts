import type { ChecklistStatus, GuidanceProgress, PrepareGuidance, ProviderCategory, ProviderSelection, SettleInGuidance } from '@movemate/contracts';
import { env } from '../../env';
import { AppError } from '../../shared/errors';
import * as moveService from '../move/move.service';
import * as repository from './guidance.repository';
import { IF_DISCOUNT, insuranceExplainer, prepareChecklist, prepareTips, providerTemplates } from './guidance.templates';

export function getPrepareGuidance(): PrepareGuidance {
  return { checklist: prepareChecklist, tips: prepareTips };
}

export function getProviders(): SettleInGuidance {
  const providers = providerTemplates.map((provider) => ({
    ...provider,
    url: provider.highlighted ? (env.IF_INSURANCE_URL ?? null) : null,
    discount: provider.highlighted ? IF_DISCOUNT : null,
  }));
  return { explainer: insuranceExplainer, providers };
}

export async function listProgress(moveId: string): Promise<GuidanceProgress[]> {
  await moveService.getById(moveId);
  const statuses = new Map((await repository.listByMove(moveId)).map((row) => [row.itemKey, row.status]));
  return prepareChecklist.map((item) => ({ ...item, status: statuses.get(item.key) ?? 'pending' }));
}

export async function setProgress(moveId: string, itemKey: string, status: ChecklistStatus): Promise<GuidanceProgress> {
  await moveService.getById(moveId);
  const item = prepareChecklist.find((candidate) => candidate.key === itemKey);
  if (!item) throw new AppError('not_found', 'Checklist item not found');
  const row = await repository.upsert(moveId, itemKey, status);
  return { ...item, status: row.status };
}

export async function getSelection(moveId: string): Promise<ProviderSelection> {
  await moveService.getById(moveId);
  const selection: ProviderSelection = { electricity: null, internet: null, home_insurance: null };
  for (const row of await repository.listSelections(moveId)) selection[row.category] = row.providerKey;
  return selection;
}

export async function setSelection(moveId: string, category: ProviderCategory, providerKey: string | null): Promise<ProviderSelection> {
  await moveService.getById(moveId);
  if (providerKey === null) {
    await repository.deleteSelection(moveId, category);
  } else {
    if (!providerTemplates.some((provider) => provider.key === providerKey && provider.category === category)) {
      throw new AppError('not_found', 'Provider not found');
    }
    await repository.upsertSelection(moveId, category, providerKey);
  }
  return getSelection(moveId);
}
