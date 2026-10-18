import { roomLabels, type ReportRoom } from '@movemate/contracts';
import { ReportPhotoGrid } from '@/components/report-photo-grid';

export function ReportPhotoAppendix({ rooms }: { rooms: ReportRoom[] }) {
  const withPhotos = rooms.filter((room) => room.beforePhotos.length + room.moveInPhotos.length > 0);
  if (withPhotos.length === 0) return null;
  return (
    <section aria-labelledby="photos-appendix-title" className="flex flex-col gap-4 border-t pt-6">
      <h2 id="photos-appendix-title" className="text-heading">
        Appendix: All photos
      </h2>
      {withPhotos.map((room) => (
        <div key={room.room} className="flex flex-col gap-2">
          <h3 className="font-medium break-after-avoid">{roomLabels[room.room]}</h3>
          {room.beforePhotos.length === 0 && <p className="text-sm text-muted-foreground">No before photos, not compared</p>}
          <ReportPhotoGrid beforePhotos={room.beforePhotos} moveInPhotos={room.moveInPhotos} roomLabel={roomLabels[room.room].toLowerCase()} showBeforeTime />
        </div>
      ))}
    </section>
  );
}
