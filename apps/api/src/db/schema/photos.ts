import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { photoStages, rooms } from '@movemate/contracts';
import { moves } from './move';

export const photos = pgTable('photos', {
  id: uuid().primaryKey().defaultRandom(),
  moveId: uuid('move_id')
    .notNull()
    .references(() => moves.id, { onDelete: 'cascade' }),
  stage: text({ enum: photoStages }).notNull(),
  room: text({ enum: rooms }).notNull(),
  filePath: text('file_path').notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
