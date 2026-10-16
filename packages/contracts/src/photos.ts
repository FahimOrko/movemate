import { z } from 'zod';

export const rooms = ['kitchen', 'living_room', 'bedroom', 'bathroom', 'hallway', 'balcony', 'other'] as const;
export const roomSchema = z.enum(rooms);
export type Room = z.infer<typeof roomSchema>;

export const photoStages = ['before', 'move_in'] as const;
export const photoStageSchema = z.enum(photoStages);
export type PhotoStage = z.infer<typeof photoStageSchema>;

export const MAX_PHOTOS_PER_ROOM = 4;

export const photoSchema = z.object({
  id: z.uuid(),
  moveId: z.uuid(),
  stage: photoStageSchema,
  room: roomSchema,
  width: z.number().int(),
  height: z.number().int(),
  createdAt: z.iso.datetime(),
  url: z.string(),
});
export type Photo = z.infer<typeof photoSchema>;

export const relabelPhotoSchema = z.object({ room: roomSchema });
export type RelabelPhoto = z.infer<typeof relabelPhotoSchema>;
