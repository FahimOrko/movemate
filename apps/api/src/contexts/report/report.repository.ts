import type { ReportSnapshot } from '@movemate/contracts';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { reports } from '../../db/schema/report';

export type ReportRow = typeof reports.$inferSelect;

export async function insertReport(moveId: string, snapshot: ReportSnapshot): Promise<ReportRow> {
  const [row] = await db.insert(reports).values({ moveId, snapshot }).returning();
  if (!row) throw new Error('Insert returned no row');
  return row;
}

export async function findReportById(id: string): Promise<ReportRow | undefined> {
  const [row] = await db.select().from(reports).where(eq(reports.id, id));
  return row;
}

export async function findLatestReport(moveId: string): Promise<ReportRow | undefined> {
  const [row] = await db.select().from(reports).where(eq(reports.moveId, moveId)).orderBy(desc(reports.createdAt), desc(reports.id)).limit(1);
  return row;
}
