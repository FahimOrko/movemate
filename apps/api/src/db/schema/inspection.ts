import { pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { aiStatuses, checkSources, confidences, resolutions, roomCheckStatuses, rooms } from '@movemate/contracts';
import { moves } from './move';
import { photos } from './photos';

export const roomChecks = pgTable('room_checks', {
  id: uuid().primaryKey().defaultRandom(),
  moveId: uuid('move_id')
    .notNull()
    .references(() => moves.id, { onDelete: 'cascade' }),
  room: text({ enum: rooms }).notNull(),
  text: text().notNull(),
  source: text({ enum: checkSources }).notNull(),
  status: text({ enum: roomCheckStatuses }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const findings = pgTable('findings', {
  id: uuid().primaryKey().defaultRandom(),
  moveId: uuid('move_id')
    .notNull()
    .references(() => moves.id, { onDelete: 'cascade' }),
  room: text({ enum: rooms }).notNull(),
  roomCheckId: uuid('room_check_id').references(() => roomChecks.id, { onDelete: 'set null' }),
  source: text({ enum: checkSources }).notNull(),
  aiStatus: text('ai_status', { enum: aiStatuses }),
  aiSummary: text('ai_summary'),
  confidence: text({ enum: confidences }),
  resolution: text({ enum: resolutions }).notNull(),
  userNote: text('user_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const findingPhotos = pgTable(
  'finding_photos',
  {
    findingId: uuid('finding_id')
      .notNull()
      .references(() => findings.id, { onDelete: 'cascade' }),
    photoId: uuid('photo_id')
      .notNull()
      .references(() => photos.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.findingId, table.photoId] })],
);
