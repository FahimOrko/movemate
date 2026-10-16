import { boolean, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { moves } from './move';

export const guidanceProgress = pgTable(
  'guidance_progress',
  {
    id: uuid().primaryKey().defaultRandom(),
    moveId: uuid('move_id')
      .notNull()
      .references(() => moves.id, { onDelete: 'cascade' }),
    itemKey: text('item_key').notNull(),
    completed: boolean().notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.moveId, table.itemKey)],
);
