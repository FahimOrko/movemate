import type { ReportSnapshot, ReportSummary } from '@movemate/contracts';

export function buildSummary(reportId: string, snapshot: ReportSnapshot): ReportSummary {
  const findings = snapshot.findingsByRoom.flatMap((group) => group.findings);
  const count = (resolution: 'ok' | 'issue' | 'custom') => findings.filter((finding) => finding.resolution === resolution).length;
  return {
    reportId,
    address: snapshot.move.address,
    moveDate: snapshot.move.moveDate,
    generatedAt: snapshot.generatedAt,
    roomsDocumented: snapshot.findingsByRoom.length,
    counts: { ok: count('ok'), issues: count('issue'), custom: count('custom') },
    watchListDueDate: snapshot.watchList[0]?.dueDate ?? null,
  };
}
