import { and, asc, count, eq } from 'drizzle-orm';
import type { PhotoStage, Room } from '@movemate/contracts';
import { db } from '../../db/client';
import { photos } from '../../db/schema/photos';

export type PhotoRow = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;

export async function insertPhoto(values: NewPhoto): Promise<PhotoRow> {
  const [row] = await db.insert(photos).values(values).returning();
  if (!row) throw new Error('Insert returned no row');
  return row;
}

export async function findPhotoById(id: string): Promise<PhotoRow | undefined> {
  const [row] = await db.select().from(photos).where(eq(photos.id, id));
  return row;
}

export async function listPhotos(moveId: string, stage?: PhotoStage): Promise<PhotoRow[]> {
  const where = stage ? and(eq(photos.moveId, moveId), eq(photos.stage, stage)) : eq(photos.moveId, moveId);
  return db.select().from(photos).where(where).orderBy(asc(photos.createdAt));
}

export async function countInRoom(moveId: string, stage: PhotoStage, room: Room): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(photos)
    .where(and(eq(photos.moveId, moveId), eq(photos.stage, stage), eq(photos.room, room)));
  return row?.total ?? 0;
}

export async function updateRoom(id: string, room: Room): Promise<PhotoRow | undefined> {
  const [row] = await db.update(photos).set({ room }).where(eq(photos.id, id)).returning();
  return row;
}

export async function deletePhoto(id: string): Promise<void> {
  await db.delete(photos).where(eq(photos.id, id));
}
