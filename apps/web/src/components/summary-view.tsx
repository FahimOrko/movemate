import type { ChecklistStatus, ProviderCategory, ReportSummary } from '@movemate/contracts';
import { Link } from 'react-router';
import { SummaryChecklist } from '@/components/summary-checklist';
import { SummaryProblems } from '@/components/summary-problems';
import { SummaryRoomChecks } from '@/components/summary-room-checks';
import { SummaryStrip } from '@/components/summary-strip';
import { formatDate, formatDateTime } from '@/lib/format';

type SummaryViewProps = {
  summary: ReportSummary;
  discountCodes: Partial<Record<ProviderCategory, string>>;
  reportHref: string;
  onChecklistStatusChange: (itemKey: string, status: ChecklistStatus) => void;
};

export function SummaryView({ summary, discountCodes, reportHref, onChecklistStatusChange }: SummaryViewProps) {
  const { totals } = summary;
  return (
    <article aria-labelledby="summary-title" className="flex flex-col gap-10">
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
        <SummaryStrip
          label="Totals"
          stats={[
            { label: 'Rooms documented', value: totals.roomsDocumented },
            { label: 'Photos before', value: totals.beforePhotos },
            { label: 'Photos move-in', value: totals.moveInPhotos },
            { label: 'Checks answered', value: `${totals.checksAnswered} of ${totals.checksTotal}` },
            { label: 'Problems found', value: totals.problems },
          ]}
        />
      </header>

      <SummaryProblems problems={summary.problems} reportHref={reportHref} />
      <SummaryRoomChecks rooms={summary.rooms} />
      <SummaryChecklist checklist={summary.checklist} onStatusChange={onChecklistStatusChange} discountCodes={discountCodes} />

      {summary.watchListDueDate && (
        <section aria-labelledby="watch-title" className="break-inside-avoid">
          <h2 id="watch-title" className="text-heading">
            30-day watch list
          </h2>
          <p className="mt-2 text-muted-foreground">Check your watch list items by {formatDate(summary.watchListDueDate)}.</p>
        </section>
      )}

      <p className="text-heading">Your move is documented and your next steps are set. Welcome home.</p>
    </article>
  );
}
