import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { checkSources, rooms } from '@movemate/contracts';
import { moves } from './move';

export const roomChecks = pgTable('room_checks', {
  id: uuid().primaryKey().defaultRandom(),
  moveId: uuid('move_id')
    .notNull()
    .references(() => moves.id, { onDelete: 'cascade' }),
  room: text({ enum: rooms }).notNull(),
  text: text().notNull(),
  source: text({ enum: checkSources }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
