import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { ReportSnapshot } from '@movemate/contracts';
import { moves } from './move';

export const reports = pgTable('reports', {
  id: uuid().primaryKey().defaultRandom(),
  moveId: uuid('move_id')
    .notNull()
    .references(() => moves.id, { onDelete: 'cascade' }),
  snapshot: jsonb().$type<ReportSnapshot>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
