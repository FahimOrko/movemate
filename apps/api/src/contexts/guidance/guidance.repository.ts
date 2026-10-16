import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { guidanceProgress } from '../../db/schema/guidance';

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
