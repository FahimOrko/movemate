import {
  REPORT_SNAPSHOT_VERSION,
  roomSchema,
  type Finding,
  type Move,
  type Photo,
  type ReportProblem,
  type ReportRoom,
  type ReportSnapshot,
  type RoomCheck,
  type WatchItem,
} from '@movemate/contracts';
import { REPORT_DISCLAIMER, WATCH_LIST_DAYS, watchListTemplates } from './report.templates';

const DAY_MS = 24 * 60 * 60 * 1000;

function dueDate(move: Move, generatedAt: Date): string {
  const base = move.moveDate ? new Date(`${move.moveDate}T00:00:00Z`) : generatedAt;
  return new Date(base.getTime() + WATCH_LIST_DAYS * DAY_MS).toISOString().slice(0, 10);
}

const findingText = (finding: Finding) => (finding.source === 'user' ? finding.userNote : finding.aiSummary) ?? '';

function problemSource(finding: Finding): ReportProblem['source'] {
  if (finding.source === 'ai') return 'ai';
  return finding.roomCheckId ? 'room_check' : 'user';
}

function toProblem(finding: Finding, resolution: ReportProblem['resolution']): ReportProblem {
  return {
    findingId: finding.id,
    source: problemSource(finding),
    checkText: finding.checkText,
    aiSummary: finding.source === 'ai' ? finding.aiSummary : null,
    resolution,
    note: finding.userNote,
    beforePhotos: finding.beforePhotos,
    moveInPhotos: finding.moveInPhotos,
  };
}

function toWatchList(findings: Finding[], due: string): WatchItem[] {
  const fromFindings = findings
    .filter((finding) => finding.aiStatus === 'unclear' || finding.resolution === 'custom')
    .map((finding) => ({
      title: finding.resolution === 'custom' ? 'Your own note' : 'Unclear in the photos',
      detail: finding.resolution === 'custom' ? (finding.userNote ?? '') : findingText(finding),
      dueDate: due,
    }));
  return [...fromFindings, ...watchListTemplates.map((template) => ({ ...template, dueDate: due }))];
}

function toRoom(room: ReportRoom['room'], photos: Photo[], checks: RoomCheck[], findings: Finding[]): ReportRoom {
  const inRoom = <T extends { room: ReportRoom['room'] }>(items: T[]) => items.filter((item) => item.room === room);
  return {
    room,
    beforePhotos: inRoom(photos).filter((photo) => photo.stage === 'before'),
    moveInPhotos: inRoom(photos).filter((photo) => photo.stage === 'move_in'),
    checks: inRoom(checks).map((check) => ({ checkId: check.id, text: check.text, source: check.source, status: check.status })),
    problems: inRoom(findings).flatMap((finding) =>
      finding.resolution === 'issue' || finding.resolution === 'custom' ? [toProblem(finding, finding.resolution)] : [],
    ),
  };
}

const hasContent = (room: ReportRoom) =>
  room.beforePhotos.length + room.moveInPhotos.length + room.checks.length + room.problems.length > 0;

export function buildSnapshot(move: Move, photos: Photo[], checks: RoomCheck[], findings: Finding[], generatedAt: Date): ReportSnapshot {
  return {
    version: REPORT_SNAPSHOT_VERSION,
    move: { address: move.address, moveDate: move.moveDate },
    generatedAt: generatedAt.toISOString(),
    rooms: roomSchema.options.map((room) => toRoom(room, photos, checks, findings)).filter(hasContent),
    watchList: toWatchList(findings, dueDate(move, generatedAt)),
    disclaimer: REPORT_DISCLAIMER,
  };
}
