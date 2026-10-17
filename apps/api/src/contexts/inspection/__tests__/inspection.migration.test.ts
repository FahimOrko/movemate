import fs from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db } from '../../../db/client';

const migration = fs.readFileSync(path.resolve(import.meta.dirname, '../../../db/migrations/0007_room_check_status.sql'), 'utf8');

describe('migration 0007 room check status', () => {
  it('makes existing room checks pending', async () => {
    const rollback = new Error('rollback');
    let rows: { text: string; status: string }[] = [];

    await db
      .transaction(async (tx) => {
        // A temp table shadows the real one for the unqualified names in the migration.
        await tx.execute(sql`create temp table room_checks (text text) on commit drop`);
        await tx.execute(sql`insert into room_checks (text) values ('old check')`);
        for (const statement of migration.split('--> statement-breakpoint')) await tx.execute(sql.raw(statement));
        rows = (await tx.execute(sql`select text, status from room_checks`)).rows as typeof rows;
        throw rollback;
      })
      .catch((error: unknown) => {
        if (error !== rollback) throw error;
      });

    expect(rows).toEqual([{ text: 'old check', status: 'pending' }]);
  });
});
