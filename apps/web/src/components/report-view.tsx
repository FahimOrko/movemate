import { reportTotals, type Report } from '@movemate/contracts';
import { ReportRoomSection } from '@/components/report-room-section';
import { SummaryStrip } from '@/components/summary-strip';
import { formatDate, formatDateTime } from '@/lib/format';

export function ReportView({ report }: { report: Report }) {
  const { snapshot } = report;
  const totals = reportTotals(snapshot);
  return (
    <article aria-labelledby="report-title" className="flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <div>
          <h1 id="report-title" className="text-title">
            Move-in report
          </h1>
          <p className="mt-2 text-base">{snapshot.move.address}</p>
          <p className="text-sm text-muted-foreground">
            {snapshot.move.moveDate && `Move date ${formatDate(snapshot.move.moveDate)}. `}Generated {formatDateTime(snapshot.generatedAt)}.
          </p>
        </div>
        <SummaryStrip
          label="Report totals"
          stats={[
            { label: 'Rooms', value: totals.roomsDocumented },
            { label: 'Photos', value: totals.beforePhotos + totals.moveInPhotos },
            { label: 'Problems', value: totals.problems },
            { label: 'Checks answered', value: `${totals.checksAnswered} of ${totals.checksTotal}` },
          ]}
        />
        {totals.problems === 0 && <p className="text-muted-foreground">No problems recorded</p>}
      </header>

      {snapshot.rooms.map((room) => (
        <ReportRoomSection key={room.room} room={room} />
      ))}

      <section aria-labelledby="watch-title" className="border-t pt-6">
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
