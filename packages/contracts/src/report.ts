import { z } from 'zod';
import { aiStatusSchema, resolutionSchema } from './inspection';
import { photoSchema, roomSchema } from './photos';

export const reportIssueSchema = z.object({
  findingId: z.uuid(),
  room: roomSchema,
  kind: z.enum(['issue', 'custom']),
  text: z.string(),
  note: z.string().nullable(),
  beforePhotos: z.array(photoSchema),
  moveInPhotos: z.array(photoSchema),
});
export type ReportIssue = z.infer<typeof reportIssueSchema>;

export const reportFindingSchema = z.object({
  findingId: z.uuid(),
  aiStatus: aiStatusSchema.nullable(),
  resolution: resolutionSchema,
  text: z.string(),
  note: z.string().nullable(),
});
export type ReportFinding = z.infer<typeof reportFindingSchema>;

export const watchItemSchema = z.object({
  title: z.string(),
  detail: z.string(),
  dueDate: z.iso.date(),
});
export type WatchItem = z.infer<typeof watchItemSchema>;

export const reportSnapshotSchema = z.object({
  move: z.object({ address: z.string(), moveDate: z.iso.date().nullable() }),
  generatedAt: z.iso.datetime(),
  issues: z.array(reportIssueSchema),
  findingsByRoom: z.array(z.object({ room: roomSchema, findings: z.array(reportFindingSchema) })),
  watchList: z.array(watchItemSchema),
  disclaimer: z.string(),
});
export type ReportSnapshot = z.infer<typeof reportSnapshotSchema>;

export const reportSchema = z.object({
  id: z.uuid(),
  moveId: z.uuid(),
  createdAt: z.iso.datetime(),
  snapshot: reportSnapshotSchema,
});
export type Report = z.infer<typeof reportSchema>;
