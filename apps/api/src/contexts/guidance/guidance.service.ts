import {
  linkedItemKeys,
  phaseOrder,
  type ChecklistItem,
  type ChecklistStatus,
  type GuidanceProgress,
  type Phase,
  type PrepareGuidance,
  type ProviderCategory,
  type ProviderSelection,
  type SettleInGuidance,
} from '@movemate/contracts';
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

function isLocked(item: ChecklistItem, phase: Phase): boolean {
  return item.linkedCategory !== undefined && phaseOrder.indexOf(phase) < phaseOrder.indexOf('settle_in');
}

export async function listProgress(moveId: string): Promise<GuidanceProgress[]> {
  const move = await moveService.getById(moveId);
  const statuses = new Map((await repository.listByMove(moveId)).map((row) => [row.itemKey, row.status]));
  const selection = await getSelection(moveId);
  return prepareChecklist.map((item) => {
    const chosen = item.linkedCategory && selection[item.linkedCategory];
    return {
      ...item,
      status: statuses.get(item.key) ?? 'pending',
      locked: isLocked(item, move.phase),
      providerName: providerTemplates.find((provider) => provider.key === chosen)?.name ?? null,
    };
  });
}

export async function setProgress(moveId: string, itemKey: string, status: ChecklistStatus): Promise<GuidanceProgress> {
  const move = await moveService.getById(moveId);
  const item = prepareChecklist.find((candidate) => candidate.key === itemKey);
  if (!item) throw new AppError('not_found', 'Checklist item not found');
  if (isLocked(item, move.phase)) throw new AppError('invalid_phase_transition', 'Available once you reach Settle in');
  await repository.upsert(moveId, itemKey, status);
  const progress = (await listProgress(moveId)).find((entry) => entry.key === itemKey);
  if (!progress) throw new AppError('not_found', 'Checklist item not found');
  return progress;
}

// A manual N/A always wins; clearing only undoes a done that the selection could have set.
async function syncLinkedItem(moveId: string, category: ProviderCategory, selected: boolean): Promise<void> {
  const itemKey = linkedItemKeys[category];
  const current = (await repository.listByMove(moveId)).find((row) => row.itemKey === itemKey)?.status ?? 'pending';
  if (selected && current !== 'na') await repository.upsert(moveId, itemKey, 'done');
  if (!selected && current === 'done') await repository.upsert(moveId, itemKey, 'pending');
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
  await syncLinkedItem(moveId, category, providerKey !== null);
  return getSelection(moveId);
}
