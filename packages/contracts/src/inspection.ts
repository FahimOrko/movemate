import { z } from 'zod';
import { photoSchema, roomSchema } from './photos';

export const checkSources = ['ai', 'user'] as const;
export const checkSourceSchema = z.enum(checkSources);
export type CheckSource = z.infer<typeof checkSourceSchema>;

export const MAX_CHECK_LENGTH = 300;

export const roomCheckStatuses = ['pending', 'ok', 'problem', 'na'] as const;
export const roomCheckStatusSchema = z.enum(roomCheckStatuses);
export type RoomCheckStatus = z.infer<typeof roomCheckStatusSchema>;

export const roomCheckProblemSchema = z.object({
  findingId: z.uuid(),
  note: z.string(),
  photos: z.array(photoSchema),
});
export type RoomCheckProblem = z.infer<typeof roomCheckProblemSchema>;

export const roomCheckSchema = z.object({
  id: z.uuid(),
  moveId: z.uuid(),
  room: roomSchema,
  text: z.string(),
  source: checkSourceSchema,
  status: roomCheckStatusSchema,
  problem: roomCheckProblemSchema.nullable(),
  createdAt: z.iso.datetime(),
});
export type RoomCheck = z.infer<typeof roomCheckSchema>;

export const createRoomCheckSchema = z.object({
  room: roomSchema,
  text: z.string().trim().min(1, 'Write a check first').max(MAX_CHECK_LENGTH, `Keep it under ${MAX_CHECK_LENGTH} characters`),
});
export type CreateRoomCheck = z.infer<typeof createRoomCheckSchema>;

// Rooms to analyze or compare; omitted means every eligible room.
export const roomSelectionSchema = z.object({ rooms: z.array(roomSchema).min(1).optional() });
export type RoomSelection = z.infer<typeof roomSelectionSchema>;

export const baselineResultSchema = z.object({
  checks: z.array(roomCheckSchema),
  failedRooms: z.array(roomSchema),
});
export type BaselineResult = z.infer<typeof baselineResultSchema>;

export const aiStatuses = ['looks_good', 'changed', 'unclear'] as const;
export const aiStatusSchema = z.enum(aiStatuses);
export type AiStatus = z.infer<typeof aiStatusSchema>;

export const confidences = ['low', 'medium', 'high'] as const;
export const confidenceSchema = z.enum(confidences);
export type Confidence = z.infer<typeof confidenceSchema>;

export const resolutions = ['pending', 'ok', 'issue', 'custom'] as const;
export const resolutionSchema = z.enum(resolutions);
export type Resolution = z.infer<typeof resolutionSchema>;

export const MAX_NOTE_LENGTH = 500;
export const MAX_SUMMARY_LENGTH = 300;

export const findingSchema = z.object({
  id: z.uuid(),
  moveId: z.uuid(),
  room: roomSchema,
  roomCheckId: z.uuid().nullable(),
  checkText: z.string().nullable(),
  source: checkSourceSchema,
  aiStatus: aiStatusSchema.nullable(),
  aiSummary: z.string().nullable(),
  confidence: confidenceSchema.nullable(),
  resolution: resolutionSchema,
  userNote: z.string().nullable(),
  beforePhotos: z.array(photoSchema),
  moveInPhotos: z.array(photoSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Finding = z.infer<typeof findingSchema>;

const noteSchema = z
  .string()
  .trim()
  .min(1, 'Write a note first')
  .max(MAX_NOTE_LENGTH, `Keep it under ${MAX_NOTE_LENGTH} characters`);

export const resolveFindingSchema = z.discriminatedUnion('resolution', [
  z.object({ resolution: z.literal('ok') }),
  z.object({ resolution: z.literal('issue'), note: noteSchema.optional() }),
  z.object({ resolution: z.literal('custom'), note: noteSchema }),
]);
export type ResolveFinding = z.infer<typeof resolveFindingSchema>;

export const MAX_PROBLEM_PHOTOS = 3;

const photoIdsSchema = z
  .array(z.uuid())
  .max(MAX_PROBLEM_PHOTOS, `Attach at most ${MAX_PROBLEM_PHOTOS} photos`)
  .refine((ids) => new Set(ids).size === ids.length, 'Attach each photo once');

export const createFindingSchema = z.object({ room: roomSchema, note: noteSchema, photoIds: photoIdsSchema.optional() });
export type CreateFinding = z.infer<typeof createFindingSchema>;

export const compareResultSchema = z.object({
  findings: z.array(findingSchema),
  failedRooms: z.array(roomSchema),
  skippedRooms: z.array(roomSchema),
});
export type CompareResult = z.infer<typeof compareResultSchema>;

export const answerRoomCheckSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('pending') }),
  z.object({ status: z.literal('ok') }),
  z.object({ status: z.literal('na') }),
  z.object({ status: z.literal('problem'), note: noteSchema, photoIds: photoIdsSchema.optional() }),
]);
export type AnswerRoomCheck = z.infer<typeof answerRoomCheckSchema>;
