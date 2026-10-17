import { checklistStatuses, providerCategories } from '@movemate/contracts';
import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { moves } from './move';

export const guidanceProgress = pgTable(
  'guidance_progress',
  {
    id: uuid().primaryKey().defaultRandom(),
    moveId: uuid('move_id')
      .notNull()
      .references(() => moves.id, { onDelete: 'cascade' }),
    itemKey: text('item_key').notNull(),
    status: text({ enum: checklistStatuses }).notNull().default('pending'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.moveId, table.itemKey)],
);

export const providerSelections = pgTable(
  'provider_selections',
  {
    id: uuid().primaryKey().defaultRandom(),
    moveId: uuid('move_id')
      .notNull()
      .references(() => moves.id, { onDelete: 'cascade' }),
    category: text({ enum: providerCategories }).notNull(),
    providerKey: text('provider_key').notNull(),
  },
  (table) => [unique().on(table.moveId, table.category)],
);
