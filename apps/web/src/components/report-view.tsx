import { roomLabels, type Report } from '@movemate/contracts';
import { ReportIssue } from '@/components/report-issue';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/lib/format';

const resolutionLabel = { pending: 'Needs your answer', ok: 'Marked OK', issue: 'Marked as an issue', custom: 'Your own note' } as const;

export function ReportView({ report }: { report: Report }) {
  const { snapshot } = report;
  return (
    <article aria-labelledby="report-title" className="flex flex-col gap-10">
      <header>
        <h1 id="report-title" className="text-title">
          Move-in report
        </h1>
        <p className="mt-2 text-base">{snapshot.move.address}</p>
        <p className="text-sm text-muted-foreground">
          {snapshot.move.moveDate && `Move date ${formatDate(snapshot.move.moveDate)}. `}Generated {formatDateTime(snapshot.generatedAt)}.
        </p>
      </header>

      <section aria-labelledby="issues-title">
        <h2 id="issues-title" className="text-heading">
          Issues
        </h2>
        {snapshot.issues.length === 0 ? (
          <p className="mt-2 text-muted-foreground">No issues recorded</p>
        ) : (
          <ul className="mt-1 divide-y">
            {snapshot.issues.map((issue) => (
              <ReportIssue key={issue.findingId} issue={issue} />
            ))}
          </ul>
        )}
      </section>

      {snapshot.findingsByRoom.length > 0 && (
        <section aria-labelledby="rooms-title" className="flex flex-col gap-4">
          <h2 id="rooms-title" className="text-heading">
            All findings by room
          </h2>
          {snapshot.findingsByRoom.map((group) => (
            <div key={group.room} className="break-inside-avoid">
              <h3 className="font-medium">{roomLabels[group.room]}</h3>
              <ul className="mt-1 divide-y">
                {group.findings.map((finding) => (
                  <li key={finding.findingId} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                    <Badge variant={finding.resolution === 'ok' ? 'success' : 'outline'}>{resolutionLabel[finding.resolution]}</Badge>
                    <span>{finding.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="watch-title">
        <h2 id="watch-title" className="text-heading">
          Watch list
        </h2>
        <ul className="mt-1 divide-y">
          {snapshot.watchList.map((item, index) => (
            <li key={`${item.title}-${index}`} className="py-3 break-inside-avoid">
              <p className="font-medium">
                {item.title} <span className="text-sm font-normal text-muted-foreground">· check by {formatDate(item.dueDate)}</span>
              </p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="border-t pt-4 text-sm text-muted-foreground">{snapshot.disclaimer}</p>
    </article>
  );
}
