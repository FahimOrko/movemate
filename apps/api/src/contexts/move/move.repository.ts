import { desc, eq } from 'drizzle-orm';
import type { Phase } from '@movemate/contracts';
import { db } from '../../db/client';
import { moves } from '../../db/schema/move';

export type MoveRow = typeof moves.$inferSelect;

export async function insertMove(values: { address: string; moveDate?: string }): Promise<MoveRow> {
  const [row] = await db.insert(moves).values(values).returning();
  if (!row) throw new Error('Insert returned no row');
  return row;
}

export async function findLatestMove(): Promise<MoveRow | undefined> {
  const [row] = await db.select().from(moves).orderBy(desc(moves.createdAt)).limit(1);
  return row;
}

export async function findMoveById(id: string): Promise<MoveRow | undefined> {
  const [row] = await db.select().from(moves).where(eq(moves.id, id));
  return row;
}

export async function updatePhase(id: string, phase: Phase): Promise<MoveRow | undefined> {
  const [row] = await db.update(moves).set({ phase, updatedAt: new Date() }).where(eq(moves.id, id)).returning();
  return row;
}

export async function deleteAllMoves(executor: Pick<typeof db, 'delete'> = db): Promise<void> {
  await executor.delete(moves);
}
