import { roomLabels, type ReportRoom } from '@movemate/contracts';
import { ReportProblem } from '@/components/report-problem';
import { roomSectionId } from '@/lib/room-section-id';

export function ReportRoomSection({ room }: { room: ReportRoom }) {
  const label = roomLabels[room.room];
  const headingId = `${roomSectionId(room.room)}-title`;
  return (
    <section id={roomSectionId(room.room)} aria-labelledby={headingId} className="scroll-mt-6">
      <header className="break-after-avoid">
        <h3 id={headingId} className="text-heading">
          {label}
        </h3>
        {room.beforePhotos.length === 0 && <p className="text-sm text-muted-foreground">No before photos, not compared</p>}
      </header>
      <ul className="divide-y">
        {room.problems.map((problem) => (
          <ReportProblem key={problem.findingId} problem={problem} roomLabel={label.toLowerCase()} />
        ))}
      </ul>
    </section>
  );
}
