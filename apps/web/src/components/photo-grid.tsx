import { roomSchema, type Photo, type Room, roomLabels } from '@movemate/contracts';
import { ImageIcon, Trash2Icon } from 'lucide-react';
import { RoomSelect } from '@/components/room-select';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type PhotoGridProps = {
  photos: Photo[];
  onRelabel: (photo: Photo, room: Room) => void;
  onDelete: (photo: Photo) => void;
  disabled?: boolean;
};

export function PhotoGrid({ photos, onRelabel, onDelete, disabled }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon />
          </EmptyMedia>
          <EmptyTitle>No photos yet</EmptyTitle>
          <EmptyDescription>Photos you upload show up here, grouped by room.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {roomSchema.options.map((room) => {
        const inRoom = photos.filter((photo) => photo.room === room);
        if (inRoom.length === 0) return null;
        return (
          <section key={room} aria-label={roomLabels[room]}>
            <h3 className="text-heading">
              {roomLabels[room]} <span className="text-sm font-normal text-muted-foreground">{inRoom.length}</span>
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {inRoom.map((photo) => (
                <li key={photo.id} className="flex flex-col gap-2">
                  <div className="relative overflow-hidden rounded-lg border bg-surface">
                    <img src={photo.url} alt={`${roomLabels[photo.room]} photo`} loading="lazy" className="aspect-4/3 w-full object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute top-2 right-2"
                      aria-label={`Delete ${roomLabels[photo.room]} photo`}
                      disabled={disabled}
                      onClick={() => onDelete(photo)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  <RoomSelect value={photo.room} onValueChange={(next) => onRelabel(photo, next)} label={`Room for ${roomLabels[photo.room]} photo`} disabled={disabled} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
