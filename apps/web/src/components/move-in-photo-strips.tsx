import { MAX_PHOTOS_PER_ROOM, type Photo, type Room, roomLabels } from '@movemate/contracts';
import { Trash2Icon } from 'lucide-react';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { PhotoUploader } from '@/components/photo-uploader';
import { RoomSelect } from '@/components/room-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/** How many move-in photos per room the AI reads; the API takes the first ones that are not attached to a problem. */
export const COMPARED_PHOTOS_PER_ROOM = 4;

type MoveInPhotoStripsProps = {
  room: Room;
  beforePhotos: Photo[];
  moveInPhotos: Photo[];
  /** Ids of move-in photos attached to the user's own problems. */
  attachedIds: ReadonlySet<string>;
  onRelabel: (photo: Photo, room: Room) => void;
  onDelete: (photo: Photo) => void;
  upload: (file: File, room: Room) => Promise<unknown>;
  disabled?: boolean;
};

type Marker = { label: string; variant: 'success' | 'secondary' | 'outline' };

function markers(moveInPhotos: Photo[], attachedIds: ReadonlySet<string>, hasBefore: boolean): Map<string, Marker> {
  const result = new Map<string, Marker>();
  let compared = 0;
  for (const photo of moveInPhotos) {
    if (attachedIds.has(photo.id)) result.set(photo.id, { label: 'Attached to a problem', variant: 'outline' });
    else if (hasBefore) {
      result.set(photo.id, compared < COMPARED_PHOTOS_PER_ROOM ? { label: 'Compared', variant: 'success' } : { label: 'Not used in comparison', variant: 'secondary' });
      compared += 1;
    }
  }
  return result;
}

export function MoveInPhotoStrips({ room, beforePhotos, moveInPhotos, attachedIds, onRelabel, onDelete, upload, disabled }: MoveInPhotoStripsProps) {
  const name = roomLabels[room];
  const lower = name.toLowerCase();
  const marked = markers(moveInPhotos, attachedIds, beforePhotos.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby={`before-strip-${room}`} className="flex flex-col gap-3">
        <h3 id={`before-strip-${room}`} className="text-heading">
          Before (listing or viewing)
        </h3>
        {beforePhotos.length === 0 ? (
          <p className="max-w-prose text-sm text-muted-foreground">
            No before photos for the {lower}, so it is not compared. You can still check it and note problems.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {beforePhotos.map((photo, index) => (
              <li key={photo.id}>
                <EnlargeablePhoto photo={photo} label={`Before photo ${index + 1} of the ${lower}`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby={`move-in-strip-${room}`} className="flex flex-col gap-3">
        <h3 id={`move-in-strip-${room}`} className="text-heading">
          Move-in (today)
        </h3>
        {moveInPhotos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No move-in photos of the {lower} yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {moveInPhotos.map((photo, index) => {
              const marker = marked.get(photo.id);
              return (
                <li key={photo.id} className="flex flex-col gap-2">
                  <EnlargeablePhoto photo={photo} label={`Move-in photo ${index + 1} of the ${lower}`} className="w-full" />
                  {marker && <Badge variant={marker.variant}>{marker.label}</Badge>}
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <RoomSelect value={photo.room} onValueChange={(next) => onRelabel(photo, next)} label={`Room for move-in photo ${index + 1} of the ${lower}`} disabled={disabled} />
                    </div>
                    <Button variant="secondary" size="icon-sm" aria-label={`Delete move-in photo ${index + 1} of the ${lower}`} disabled={disabled} onClick={() => onDelete(photo)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <PhotoUploader room={room} existingCounts={{ [room]: moveInPhotos.length }} maxPerRoom={MAX_PHOTOS_PER_ROOM.move_in} upload={upload} disabled={disabled} />
      </section>
    </div>
  );
}
