import { checkAnswerLabels, checkCounts, checkStatusLine, photoCountLine, roomLabels, type ReportRoom } from '@movemate/contracts';
import { ReportPhotoStrip } from '@/components/report-photo-strip';
import { ReportProblem } from '@/components/report-problem';
import { roomSectionId } from '@/lib/room-section-id';

export function ReportRoomSection({ room }: { room: ReportRoom }) {
  const label = roomLabels[room.room];
  const lower = label.toLowerCase();
  const headingId = `${roomSectionId(room.room)}-title`;
  return (
    <section id={roomSectionId(room.room)} aria-labelledby={headingId} className="flex scroll-mt-6 flex-col gap-5 border-t pt-6">
      <header className="break-after-avoid">
        <h2 id={headingId} className="text-heading">
          {label}
        </h2>
        <p className="text-sm text-muted-foreground">{photoCountLine(room)}</p>
      </header>

      <div className="flex flex-col gap-4">
        {room.beforePhotos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No before photos, not compared</p>
        ) : (
          <ReportPhotoStrip stage="before" photos={room.beforePhotos} roomLabel={lower} />
        )}
        <ReportPhotoStrip stage="move_in" photos={room.moveInPhotos} roomLabel={lower} />
      </div>

      {room.checks.length > 0 && <p className="text-sm font-medium">{checkStatusLine(checkCounts(room.checks))}</p>}

      <div>
        <h3 className="font-medium">Problems</h3>
        {room.problems.length === 0 ? (
          <p className="mt-1 text-muted-foreground">No problems recorded</p>
        ) : (
          <ul className="divide-y">
            {room.problems.map((problem) => (
              <ReportProblem key={problem.findingId} problem={problem} roomLabel={lower} />
            ))}
          </ul>
        )}
      </div>

      {room.checks.length > 0 && (
        <>
          <details className="group print:hidden">
            <summary className="w-fit cursor-pointer rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              Room checks ({room.checks.length})
            </summary>
            <ul className="mt-2 divide-y">
              {room.checks.map((check) => (
                <li key={check.checkId} className="flex justify-between gap-4 py-2 text-sm">
                  <span>{check.text}</span>
                  <span className="shrink-0 text-muted-foreground">{checkAnswerLabels[check.status]}</span>
                </li>
              ))}
            </ul>
          </details>
          <div className="hidden break-inside-avoid print:block">
            <h3 className="text-sm font-medium">Room checks</h3>
            <ul className="mt-1 columns-2 gap-6 text-xs">
              {room.checks.map((check) => (
                <li key={check.checkId} className="break-inside-avoid py-0.5">
                  {check.text}: {checkAnswerLabels[check.status]}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
