import type { ReportProblem } from '@movemate/contracts';

export type ProblemParts = { lead: string; secondary: string | null; sourceLabel: string };

/** Landlord-facing wording of a problem: a plain lead, optional small secondary text and a source label. */
export function problemParts(problem: ReportProblem): ProblemParts {
  const { source, resolution, note, aiSummary, checkText } = problem;
  const sourceLabel = source === 'ai' && resolution === 'issue' ? 'Photo comparison, confirmed by tenant' : 'Tenant note';
  if (source === 'room_check') return { lead: note ?? checkText ?? '', secondary: note ? checkText : null, sourceLabel };
  if (source === 'ai' && resolution === 'issue') return { lead: aiSummary ?? note ?? '', secondary: aiSummary ? note : null, sourceLabel };
  return { lead: note ?? aiSummary ?? '', secondary: null, sourceLabel };
}
