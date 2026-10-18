import { reportTotals, type Report } from '@movemate/contracts';
import { ReportChecksAppendix } from '@/components/report-checks-appendix';
import { ReportPhotoAppendix } from '@/components/report-photo-appendix';
import { ReportProblemsTable } from '@/components/report-problems-table';
import { ReportRoomSection } from '@/components/report-room-section';
import { StatCard } from '@/components/stat-card';
import { formatDate, formatDateTime } from '@/lib/format';

export function ReportView({ report }: { report: Report }) {
  const { snapshot } = report;
  const totals = reportTotals(snapshot);
  const roomsWithProblems = snapshot.rooms.filter((room) => room.problems.length > 0);
  return (
    <article aria-labelledby="report-title" className="flex flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div>
          <h1 id="report-title" className="text-title">
            Move-in report
          </h1>
          <p className="mt-2 text-base">{snapshot.move.address}</p>
          <p className="text-sm text-muted-foreground">
            {snapshot.move.moveDate && `Move date ${formatDate(snapshot.move.moveDate)}. `}Generated {formatDateTime(snapshot.generatedAt)}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Condition notes and photos recorded by the tenant at move-in.</p>
        </div>
        <dl aria-label="Report totals" className="grid grid-cols-3 gap-3">
          <StatCard label="Rooms" value={totals.roomsDocumented} />
          <StatCard label="Photos" value={totals.beforePhotos + totals.moveInPhotos} />
          <StatCard label="Problems" value={totals.problems} />
        </dl>
      </header>

      <section aria-labelledby="problems-title" className="flex flex-col gap-3">
        <h2 id="problems-title" className="text-heading">
          Problems found
        </h2>
        <ReportProblemsTable rooms={snapshot.rooms} />
      </section>

      {roomsWithProblems.length > 0 && (
        <section aria-labelledby="details-title" className="flex flex-col gap-6">
          <h2 id="details-title" className="text-heading">
            Problem details
          </h2>
          {roomsWithProblems.map((room) => (
            <ReportRoomSection key={room.room} room={room} />
          ))}
        </section>
      )}

      <section aria-labelledby="watch-title" className="border-t pt-6">
        <h2 id="watch-title" className="text-heading">
          Watch list
        </h2>
        <ul className="mt-1 divide-y">
          {snapshot.watchList.map((item, index) => (
            <li key={`${item.title}-${index}`} className="py-2 break-inside-avoid">
              <p className="font-medium">
                {item.title} <span className="text-sm font-normal text-muted-foreground">· check by {formatDate(item.dueDate)}</span>
              </p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <ReportPhotoAppendix rooms={snapshot.rooms} />
      <ReportChecksAppendix rooms={snapshot.rooms} />

      <p className="border-t pt-4 text-sm text-muted-foreground">{snapshot.disclaimer}</p>
    </article>
  );
}
