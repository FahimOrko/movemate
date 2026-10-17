import { roomSchema, type Finding, type Move, type ReportFinding, type ReportIssue, type ReportSnapshot, type WatchItem } from '@movemate/contracts';
import { REPORT_DISCLAIMER, WATCH_LIST_DAYS, watchListTemplates } from './report.templates';

const DAY_MS = 24 * 60 * 60 * 1000;

function dueDate(move: Move, generatedAt: Date): string {
  const base = move.moveDate ? new Date(`${move.moveDate}T00:00:00Z`) : generatedAt;
  return new Date(base.getTime() + WATCH_LIST_DAYS * DAY_MS).toISOString().slice(0, 10);
}

const findingText = (finding: Finding) => (finding.source === 'user' ? finding.userNote : finding.aiSummary) ?? '';

function toIssue(finding: Finding, kind: ReportIssue['kind']): ReportIssue {
  return {
    findingId: finding.id,
    room: finding.room,
    kind,
    text: findingText(finding),
    note: finding.source === 'user' ? null : finding.userNote,
    beforePhotos: finding.beforePhotos,
    moveInPhotos: finding.moveInPhotos,
  };
}

function toReportFinding(finding: Finding): ReportFinding {
  return {
    findingId: finding.id,
    aiStatus: finding.aiStatus,
    resolution: finding.resolution,
    text: findingText(finding),
    note: finding.source === 'user' ? null : finding.userNote,
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

export function buildSnapshot(move: Move, findings: Finding[], generatedAt: Date): ReportSnapshot {
  return {
    move: { address: move.address, moveDate: move.moveDate },
    generatedAt: generatedAt.toISOString(),
    issues: findings.flatMap((finding) => (finding.resolution === 'issue' || finding.resolution === 'custom' ? [toIssue(finding, finding.resolution)] : [])),
    findingsByRoom: roomSchema.options
      .map((room) => ({ room, findings: findings.filter((finding) => finding.room === room).map(toReportFinding) }))
      .filter((group) => group.findings.length > 0),
    watchList: toWatchList(findings, dueDate(move, generatedAt)),
    disclaimer: REPORT_DISCLAIMER,
  };
}
