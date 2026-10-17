import type { AiStatus, CheckSource, Confidence, Resolution, Room, RoomCheckStatus } from '@movemate/contracts';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { findingPhotos, findings, roomChecks } from '../../db/schema/inspection';

export type RoomCheckRow = typeof roomChecks.$inferSelect;
export type FindingRow = typeof findings.$inferSelect;
export type FindingPhotoLink = { findingId: string; photoId: string };
export type AiFindingDraft = {
  roomCheckId: string | null;
  aiStatus: AiStatus;
  aiSummary: string;
  confidence: Confidence;
  photoIds: string[];
};

export function listByMove(moveId: string): Promise<RoomCheckRow[]> {
  return db.select().from(roomChecks).where(eq(roomChecks.moveId, moveId)).orderBy(asc(roomChecks.createdAt), asc(roomChecks.id));
}

export async function insertCheck(moveId: string, room: Room, text: string, source: CheckSource): Promise<RoomCheckRow> {
  const [row] = await db.insert(roomChecks).values({ moveId, room, text, source }).returning();
  if (!row) throw new Error('Insert returned no row');
  return row;
}

export async function findCheckById(id: string): Promise<RoomCheckRow | undefined> {
  const [row] = await db.select().from(roomChecks).where(eq(roomChecks.id, id));
  return row;
}

export async function deleteCheck(id: string): Promise<RoomCheckRow | undefined> {
  const [row] = await db.delete(roomChecks).where(eq(roomChecks.id, id)).returning();
  return row;
}

// Replaces only checks the user has not answered yet. Answered AI checks and user-written checks stay.
export async function replaceAiChecks(moveId: string, room: Room, texts: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(roomChecks).where(and(eq(roomChecks.moveId, moveId), eq(roomChecks.room, room), eq(roomChecks.source, 'ai'), eq(roomChecks.status, 'pending')));
    if (texts.length > 0) await tx.insert(roomChecks).values(texts.map((text) => ({ moveId, room, text, source: 'ai' as const })));
  });
}

export function listFindings(moveId: string): Promise<FindingRow[]> {
  return db.select().from(findings).where(eq(findings.moveId, moveId)).orderBy(asc(findings.createdAt), asc(findings.id));
}

export function listFindingPhotoLinks(moveId: string): Promise<FindingPhotoLink[]> {
  return db
    .select({ findingId: findingPhotos.findingId, photoId: findingPhotos.photoId })
    .from(findingPhotos)
    .innerJoin(findings, eq(findings.id, findingPhotos.findingId))
    .where(eq(findings.moveId, moveId));
}

export async function findFindingById(id: string): Promise<FindingRow | undefined> {
  const [row] = await db.select().from(findings).where(eq(findings.id, id));
  return row;
}

// Never touches user-written findings or other rooms. One transaction, so a room is replaced whole or not at all.
export async function replaceAiFindings(moveId: string, room: Room, drafts: AiFindingDraft[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(findings).where(and(eq(findings.moveId, moveId), eq(findings.room, room), eq(findings.source, 'ai')));
    if (drafts.length === 0) return;
    const now = Date.now();
    const inserted = await tx
      .insert(findings)
      .values(
        drafts.map(({ roomCheckId, aiStatus, aiSummary, confidence }, index) => ({
          moveId,
          createdAt: new Date(now + index), // 1 ms apart so listing keeps the order the model returned
          room,
          roomCheckId,
          source: 'ai' as const,
          aiStatus,
          aiSummary,
          confidence,
          resolution: 'pending' as const,
        })),
      )
      .returning({ id: findings.id });
    const links = inserted.flatMap(({ id }, index) => (drafts[index]?.photoIds ?? []).map((photoId) => ({ findingId: id, photoId })));
    if (links.length > 0) await tx.insert(findingPhotos).values(links);
  });
}

export type ProblemInput = { note: string; photoIds: string[] };

export function listUserFindingPhotoIds(moveId: string): Promise<string[]> {
  return db
    .select({ photoId: findingPhotos.photoId })
    .from(findingPhotos)
    .innerJoin(findings, eq(findings.id, findingPhotos.findingId))
    .where(and(eq(findings.moveId, moveId), eq(findings.source, 'user')))
    .then((rows) => rows.map((row) => row.photoId));
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function setPhotoLinks(tx: Tx, findingId: string, photoIds: string[]): Promise<void> {
  await tx.delete(findingPhotos).where(eq(findingPhotos.findingId, findingId));
  if (photoIds.length > 0) await tx.insert(findingPhotos).values(photoIds.map((photoId) => ({ findingId, photoId })));
}

async function insertUserFindingIn(tx: Tx, moveId: string, room: Room, roomCheckId: string | null, problem: ProblemInput): Promise<FindingRow> {
  const [row] = await tx
    .insert(findings)
    .values({ moveId, room, roomCheckId, source: 'user', resolution: 'issue', userNote: problem.note })
    .returning();
  if (!row) throw new Error('Insert returned no row');
  await setPhotoLinks(tx, row.id, problem.photoIds);
  return row;
}

export function insertUserFinding(moveId: string, room: Room, problem: ProblemInput): Promise<FindingRow> {
  return db.transaction((tx) => insertUserFindingIn(tx, moveId, room, null, problem));
}

// The user finding linked to a check is its problem. AI findings that share the check are never touched.
export async function answerCheck(check: RoomCheckRow, status: RoomCheckStatus, problem?: ProblemInput): Promise<RoomCheckRow> {
  return db.transaction(async (tx) => {
    const [updated] = await tx.update(roomChecks).set({ status }).where(eq(roomChecks.id, check.id)).returning();
    if (!updated) throw new Error('Update returned no row');
    const linked = and(eq(findings.roomCheckId, check.id), eq(findings.source, 'user'));
    const [existing] = await tx.select().from(findings).where(linked);
    if (!problem) {
      await tx.delete(findings).where(linked);
    } else if (existing) {
      await tx.update(findings).set({ userNote: problem.note, updatedAt: new Date() }).where(eq(findings.id, existing.id));
      await setPhotoLinks(tx, existing.id, problem.photoIds);
    } else {
      await insertUserFindingIn(tx, check.moveId, check.room, check.id, problem);
    }
    return updated;
  });
}

export async function updateResolution(id: string, resolution: Resolution, userNote: string | null): Promise<FindingRow | undefined> {
  const [row] = await db.update(findings).set({ resolution, userNote, updatedAt: new Date() }).where(eq(findings.id, id)).returning();
  return row;
}

export async function deleteFinding(id: string): Promise<void> {
  await db.delete(findings).where(eq(findings.id, id));
}
