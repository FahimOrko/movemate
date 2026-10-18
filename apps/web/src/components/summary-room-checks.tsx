import { checkStatusLine, roomLabels, type ReportSummary } from '@movemate/contracts';

export function SummaryRoomChecks({ rooms }: { rooms: ReportSummary['rooms'] }) {
  return (
    <section aria-labelledby="room-checks-title" className="flex flex-col gap-3">
      <h2 id="room-checks-title" className="text-heading">
        Room checks
      </h2>
      {rooms.length === 0 ? (
        <p className="text-muted-foreground">No room checks were made.</p>
      ) : (
        <ul className="divide-y">
          {rooms.map(({ room, counts, notChecked }) => (
            <li key={room} className="py-3 break-inside-avoid">
              <p className="flex flex-wrap justify-between gap-x-4">
                <span className="font-medium">{roomLabels[room]}</span>
                <span className="text-sm text-muted-foreground">{checkStatusLine(counts)}</span>
              </p>
              {notChecked.length > 0 && (
                <div className="mt-1 text-sm">
                  <p className="text-muted-foreground">Not checked</p>
                  <ul className="list-disc pl-5">
                    {notChecked.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
