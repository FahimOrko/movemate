import type { ProviderCategory } from '@movemate/contracts';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { guidanceProgress, providerSelections } from '../../db/schema/guidance';

export async function listByMove(moveId: string) {
  return db
    .select({ itemKey: guidanceProgress.itemKey, completed: guidanceProgress.completed })
    .from(guidanceProgress)
    .where(eq(guidanceProgress.moveId, moveId));
}

export async function upsert(moveId: string, itemKey: string, completed: boolean) {
  const [row] = await db
    .insert(guidanceProgress)
    .values({ moveId, itemKey, completed })
    .onConflictDoUpdate({
      target: [guidanceProgress.moveId, guidanceProgress.itemKey],
      set: { completed, updatedAt: new Date() },
    })
    .returning({ itemKey: guidanceProgress.itemKey, completed: guidanceProgress.completed });
  if (!row) throw new Error('Upsert returned no row');
  return row;
}

export async function listSelections(moveId: string) {
  return db
    .select({ category: providerSelections.category, providerKey: providerSelections.providerKey })
    .from(providerSelections)
    .where(eq(providerSelections.moveId, moveId));
}

export async function upsertSelection(moveId: string, category: ProviderCategory, providerKey: string) {
  await db
    .insert(providerSelections)
    .values({ moveId, category, providerKey })
    .onConflictDoUpdate({ target: [providerSelections.moveId, providerSelections.category], set: { providerKey } });
}

export async function deleteSelection(moveId: string, category: ProviderCategory) {
  await db.delete(providerSelections).where(and(eq(providerSelections.moveId, moveId), eq(providerSelections.category, category)));
}
