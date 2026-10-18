import type { Finding, RoomCheck } from '@movemate/contracts';

/** Open work on the Move-in screen: unanswered room checks plus findings still waiting for an answer. */
export function countOpenMoveIn(checks: RoomCheck[], findings: Finding[]) {
  const openChecks = checks.filter((check) => check.status === 'pending').length;
  const openFindings = findings.filter((finding) => finding.resolution === 'pending').length;
  return { openChecks, openFindings, total: openChecks + openFindings };
}
