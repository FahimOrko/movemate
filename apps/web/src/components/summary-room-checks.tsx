import { checkStatusLine, roomLabels, type ReportSummary } from '@movemate/contracts';
import { SummarySection } from '@/components/summary-section';

export function SummaryRoomChecks({ rooms }: { rooms: ReportSummary['rooms'] }) {
  return (
    <SummarySection id="room-checks-title" title="Room checks">
      {rooms.length === 0 ? (
        <p className="text-muted-foreground">No room checks were made.</p>
      ) : (
        <ul className="divide-y">
          {rooms.map(({ room, counts, notChecked }) => (
            <li key={room} className="flex flex-col gap-2 py-3 break-inside-avoid">
              <p className="flex flex-wrap justify-between gap-x-4">
                <span className="font-medium">{roomLabels[room]}</span>
                <span className="text-sm text-muted-foreground">{checkStatusLine(counts)}</span>
              </p>
              <div
                role="progressbar"
                aria-label={`${roomLabels[room]} room checks answered`}
                aria-valuemin={0}
                aria-valuemax={counts.total}
                aria-valuenow={counts.checked}
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${counts.total === 0 ? 0 : (counts.checked / counts.total) * 100}%` }} />
              </div>
              {notChecked.length > 0 && (
                <div className="text-sm">
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
    </SummarySection>
  );
}
