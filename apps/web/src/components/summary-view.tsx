import type { ChecklistStatus, ProviderCategory, Report, ReportSummary } from '@movemate/contracts';
import { Link } from 'react-router';
import { StatCard } from '@/components/stat-card';
import { SummaryChecklist } from '@/components/summary-checklist';
import { SummaryProblems } from '@/components/summary-problems';
import { SummaryRoomChecks } from '@/components/summary-room-checks';
import { SummarySection } from '@/components/summary-section';
import { formatDate, formatDateTime } from '@/lib/format';

type SummaryViewProps = {
  summary: ReportSummary;
  /** The report the summary was built from; gives problems their thumbnails. */
  report?: Report;
  discountCodes: Partial<Record<ProviderCategory, string>>;
  reportHref: string;
  onChecklistStatusChange: (itemKey: string, status: ChecklistStatus) => void;
};

function problemThumbnails(summary: ReportSummary, report?: Report) {
  const problems = report?.snapshot.rooms.flatMap((room) => room.problems) ?? [];
  // The summary lists problems in snapshot order; skip thumbnails if the two ever disagree.
  if (problems.length !== summary.problems.length) return summary.problems.map(() => undefined);
  return problems.map((problem) => problem.moveInPhotos[0] ?? problem.beforePhotos[0]);
}

export function SummaryView({ summary, report, discountCodes, reportHref, onChecklistStatusChange }: SummaryViewProps) {
  const { totals } = summary;
  return (
    <article aria-labelledby="summary-title" className="flex flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div>
          <h1 id="summary-title" className="text-title">
            Your move, summed up
          </h1>
          <p className="mt-2 text-base">{summary.address}</p>
          <p className="text-sm text-muted-foreground">
            {summary.moveDate && `Move date ${formatDate(summary.moveDate)}. `}Report generated {formatDateTime(summary.generatedAt)}.
          </p>
          <Link to={reportHref} className="mt-1 inline-block rounded-sm text-primary underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 print:hidden">
            Open the full report
          </Link>
        </div>
        <dl aria-label="Totals" className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
          <StatCard label="Rooms" value={totals.roomsDocumented} />
          <StatCard label="Photos" value={totals.beforePhotos + totals.moveInPhotos} />
          <StatCard label="Problems" value={totals.problems} />
          <StatCard label="Checks answered" value={`${totals.checksAnswered} of ${totals.checksTotal}`} />
        </dl>
      </header>

      <SummaryProblems problems={summary.problems} thumbnails={problemThumbnails(summary, report)} reportHref={reportHref} />
      <SummaryRoomChecks rooms={summary.rooms} />
      <SummaryChecklist checklist={summary.checklist} onStatusChange={onChecklistStatusChange} discountCodes={discountCodes} />

      {summary.watchListDueDate && (
        <SummarySection id="watch-title" title="30-day watch list">
          <p className="text-muted-foreground">Check your watch list items by {formatDate(summary.watchListDueDate)}.</p>
        </SummarySection>
      )}

      <p className="text-heading">Your move is documented and your next steps are set. Welcome home.</p>
    </article>
  );
}
