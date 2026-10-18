import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { moves } from './move';

export const reports = pgTable('reports', {
  id: uuid().primaryKey().defaultRandom(),
  moveId: uuid('move_id')
    .notNull()
    .references(() => moves.id, { onDelete: 'cascade' }),
  snapshot: jsonb().$type<unknown>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
