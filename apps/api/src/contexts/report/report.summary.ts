import { checkCounts, isHandled, reportTotals, type GuidanceProgress, type ReportSnapshot, type ReportSummary } from '@movemate/contracts';

export function buildSummary(reportId: string, snapshot: ReportSnapshot, checklist: GuidanceProgress[]): ReportSummary {
  return {
    reportId,
    address: snapshot.move.address,
    moveDate: snapshot.move.moveDate,
    generatedAt: snapshot.generatedAt,
    totals: reportTotals(snapshot),
    problems: snapshot.rooms.flatMap(({ room, problems }) =>
      problems.map((problem) => ({
        room,
        source: problem.source,
        text: problem.note ?? problem.aiSummary ?? problem.checkText ?? '',
        photoCount: problem.beforePhotos.length + problem.moveInPhotos.length,
      })),
    ),
    rooms: snapshot.rooms
      .filter(({ checks }) => checks.length > 0)
      .map(({ room, checks }) => ({
        room,
        counts: checkCounts(checks),
        notChecked: checks.filter((check) => check.status === 'pending').map((check) => check.text),
      })),
    watchListDueDate: snapshot.watchList[0]?.dueDate ?? null,
    checklist: {
      open: checklist.filter((item) => !isHandled(item.status)),
      handled: checklist.filter((item) => isHandled(item.status)),
    },
  };
}
