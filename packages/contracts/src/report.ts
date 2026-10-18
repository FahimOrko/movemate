import { z } from 'zod';
import { guidanceProgressSchema } from './guidance';
import { checkSourceSchema, roomCheckStatusSchema, type RoomCheckStatus } from './inspection';
import { photoSchema, roomSchema } from './photos';

export const REPORT_SNAPSHOT_VERSION = 2;

export const problemSources = ['room_check', 'ai', 'user'] as const;
export const problemSourceSchema = z.enum(problemSources);
export type ProblemSource = z.infer<typeof problemSourceSchema>;

export const problemSourceLabels: Record<ProblemSource, string> = {
  room_check: 'Room check',
  ai: 'AI finding',
  user: 'Added by you',
};

export const reportCheckSchema = z.object({
  checkId: z.uuid(),
  text: z.string(),
  source: checkSourceSchema,
  status: roomCheckStatusSchema,
});
export type ReportCheck = z.infer<typeof reportCheckSchema>;

export const reportProblemSchema = z.object({
  findingId: z.uuid(),
  source: problemSourceSchema,
  /** The room check this problem answers (room_check source). */
  checkText: z.string().nullable(),
  /** What the AI saw (ai source). */
  aiSummary: z.string().nullable(),
  /** AI findings: `issue` confirms the AI, `custom` is the renter's own answer. Other sources are always `issue`. */
  resolution: z.enum(['issue', 'custom']),
  /** The renter's words. */
  note: z.string().nullable(),
  beforePhotos: z.array(photoSchema),
  moveInPhotos: z.array(photoSchema),
});
export type ReportProblem = z.infer<typeof reportProblemSchema>;

export const reportRoomSchema = z.object({
  room: roomSchema,
  beforePhotos: z.array(photoSchema),
  moveInPhotos: z.array(photoSchema),
  checks: z.array(reportCheckSchema),
  problems: z.array(reportProblemSchema),
});
export type ReportRoom = z.infer<typeof reportRoomSchema>;

export const watchItemSchema = z.object({
  title: z.string(),
  detail: z.string(),
  dueDate: z.iso.date(),
});
export type WatchItem = z.infer<typeof watchItemSchema>;

export const reportSnapshotSchema = z.object({
  version: z.literal(REPORT_SNAPSHOT_VERSION),
  move: z.object({ address: z.string(), moveDate: z.iso.date().nullable() }),
  generatedAt: z.iso.datetime(),
  /** Fixed room order; only rooms with a photo, a check or a problem. */
  rooms: z.array(reportRoomSchema),
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

export const checkAnswerLabels: Record<RoomCheckStatus, string> = {
  ok: 'Looks fine',
  problem: 'Problem',
  na: 'N/A',
  pending: 'Not checked',
};

export type CheckCounts = { total: number; checked: number; problems: number; na: number };

export function checkCounts(checks: Pick<ReportCheck, 'status'>[]): CheckCounts {
  const count = (status: RoomCheckStatus) => checks.filter((check) => check.status === status).length;
  return { total: checks.length, checked: checks.length - count('pending'), problems: count('problem'), na: count('na') };
}

/** "5 of 7 checked, 1 problem, 1 N/A" */
export function checkStatusLine(counts: CheckCounts): string {
  if (counts.total === 0) return 'No room checks';
  const parts = [`${counts.checked} of ${counts.total} checked`];
  if (counts.problems > 0) parts.push(`${counts.problems} ${counts.problems === 1 ? 'problem' : 'problems'}`);
  if (counts.na > 0) parts.push(`${counts.na} N/A`);
  return parts.join(', ');
}

/** "3 before photos, 2 move-in photos" */
export function photoCountLine(room: Pick<ReportRoom, 'beforePhotos' | 'moveInPhotos'>): string {
  const plural = (count: number, label: string) => `${count} ${label} ${count === 1 ? 'photo' : 'photos'}`;
  return `${plural(room.beforePhotos.length, 'before')}, ${plural(room.moveInPhotos.length, 'move-in')}`;
}

export const reportTotalsSchema = z.object({
  roomsDocumented: z.number(),
  beforePhotos: z.number(),
  moveInPhotos: z.number(),
  checksAnswered: z.number(),
  checksTotal: z.number(),
  problems: z.number(),
});
export type ReportTotals = z.infer<typeof reportTotalsSchema>;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function reportTotals(snapshot: Pick<ReportSnapshot, 'rooms'>): ReportTotals {
  const { rooms } = snapshot;
  return {
    roomsDocumented: rooms.filter((room) => room.beforePhotos.length + room.moveInPhotos.length > 0).length,
    beforePhotos: sum(rooms.map((room) => room.beforePhotos.length)),
    moveInPhotos: sum(rooms.map((room) => room.moveInPhotos.length)),
    checksAnswered: sum(rooms.map((room) => checkCounts(room.checks).checked)),
    checksTotal: sum(rooms.map((room) => room.checks.length)),
    problems: sum(rooms.map((room) => room.problems.length)),
  };
}

export const reportSummarySchema = z.object({
  reportId: z.uuid(),
  address: z.string(),
  moveDate: z.iso.date().nullable(),
  generatedAt: z.iso.datetime(),
  totals: reportTotalsSchema,
  problems: z.array(
    z.object({
      room: roomSchema,
      source: problemSourceSchema,
      text: z.string(),
      photoCount: z.number(),
    }),
  ),
  rooms: z.array(
    z.object({
      room: roomSchema,
      counts: z.object({ total: z.number(), checked: z.number(), problems: z.number(), na: z.number() }),
      notChecked: z.array(z.string()),
    }),
  ),
  watchListDueDate: z.iso.date().nullable(),
  checklist: z.object({ open: z.array(guidanceProgressSchema), handled: z.array(guidanceProgressSchema) }),
});
export type ReportSummary = z.infer<typeof reportSummarySchema>;
