import { z } from 'zod';
import { roomSchema } from './photos';

export const checkSources = ['ai', 'user'] as const;
export const checkSourceSchema = z.enum(checkSources);
export type CheckSource = z.infer<typeof checkSourceSchema>;

export const MAX_CHECK_LENGTH = 300;

export const roomCheckSchema = z.object({
  id: z.uuid(),
  moveId: z.uuid(),
  room: roomSchema,
  text: z.string(),
  source: checkSourceSchema,
  createdAt: z.iso.datetime(),
});
export type RoomCheck = z.infer<typeof roomCheckSchema>;

export const createRoomCheckSchema = z.object({
  room: roomSchema,
  text: z.string().trim().min(1, 'Write a check first').max(MAX_CHECK_LENGTH, `Keep it under ${MAX_CHECK_LENGTH} characters`),
});
export type CreateRoomCheck = z.infer<typeof createRoomCheckSchema>;

// Rooms to analyze; omitted means every room that has before photos.
export const runBaselineSchema = z.object({ rooms: z.array(roomSchema).min(1).optional() });
export type RunBaseline = z.infer<typeof runBaselineSchema>;

export const baselineResultSchema = z.object({
  checks: z.array(roomCheckSchema),
  failedRooms: z.array(roomSchema),
});
export type BaselineResult = z.infer<typeof baselineResultSchema>;
