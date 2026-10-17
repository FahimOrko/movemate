import fs from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db } from '../../../db/client';

const migration = fs.readFileSync(path.resolve(import.meta.dirname, '../../../db/migrations/0006_checklist_status.sql'), 'utf8');

describe('migration 0006 checklist status', () => {
  it('backfills completed=true to done and false to pending, then drops completed', async () => {
    const rollback = new Error('rollback');
    let rows: { item_key: string; status: string }[] = [];
    let columns: string[] = [];

    await db
      .transaction(async (tx) => {
        // A temp table shadows the real one for the unqualified names in the migration.
        await tx.execute(sql`create temp table guidance_progress (item_key text, completed boolean not null default false) on commit drop`);
        await tx.execute(sql`insert into guidance_progress (item_key, completed) values ('a', true), ('b', false)`);
        for (const statement of migration.split('--> statement-breakpoint')) await tx.execute(sql.raw(statement));
        rows = (await tx.execute(sql`select item_key, status from guidance_progress order by item_key`)).rows as typeof rows;
        columns = (await tx.execute(sql`select * from guidance_progress limit 1`)).fields.map((field) => field.name);
        throw rollback;
      })
      .catch((error: unknown) => {
        if (error !== rollback) throw error;
      });

    expect(rows).toEqual([
      { item_key: 'a', status: 'done' },
      { item_key: 'b', status: 'pending' },
    ]);
    expect(columns).not.toContain('completed');
  });
});
