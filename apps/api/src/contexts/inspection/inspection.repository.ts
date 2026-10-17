import type { CheckSource, Room } from '@movemate/contracts';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { roomChecks } from '../../db/schema/inspection';

export type RoomCheckRow = typeof roomChecks.$inferSelect;

export function listByMove(moveId: string): Promise<RoomCheckRow[]> {
  return db.select().from(roomChecks).where(eq(roomChecks.moveId, moveId)).orderBy(asc(roomChecks.createdAt), asc(roomChecks.id));
}

export async function insertCheck(moveId: string, room: Room, text: string, source: CheckSource): Promise<RoomCheckRow> {
  const [row] = await db.insert(roomChecks).values({ moveId, room, text, source }).returning();
  if (!row) throw new Error('Insert returned no row');
  return row;
}

export async function deleteCheck(id: string): Promise<RoomCheckRow | undefined> {
  const [row] = await db.delete(roomChecks).where(eq(roomChecks.id, id)).returning();
  return row;
}

// Never touches user-written checks.
export async function replaceAiChecks(moveId: string, room: Room, texts: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(roomChecks).where(and(eq(roomChecks.moveId, moveId), eq(roomChecks.room, room), eq(roomChecks.source, 'ai')));
    if (texts.length > 0) await tx.insert(roomChecks).values(texts.map((text) => ({ moveId, room, text, source: 'ai' as const })));
  });
}
