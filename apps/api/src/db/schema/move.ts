import { date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { phaseOrder } from '@movemate/contracts';

export const moves = pgTable('moves', {
  id: uuid().primaryKey().defaultRandom(),
  address: text().notNull(),
  moveDate: date('move_date'),
  phase: text({ enum: phaseOrder }).notNull().default('prepare'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
