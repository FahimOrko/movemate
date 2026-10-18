import { type Photo, type Room, type RoomCheck, roomLabels } from '@movemate/contracts';
import { ChevronLeftIcon, ChevronRightIcon, Trash2Icon } from 'lucide-react';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { RoomCheckList } from '@/components/room-check-list';
import { RoomSelect } from '@/components/room-select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type RoomDialogShellProps = {
  /** Rooms that can be opened, in display order. */
  rooms: Room[];
  /** The open room, or null when closed. */
  room: Room | null;
  onRoomChange: (room: Room) => void;
  onClose: () => void;
  /** Read by screen readers after the title, for example "Photos and room checks for the kitchen." */
  describe: (name: string) => string;
  children: (room: Room) => ReactNode;
};

/** The dialog frame shared by every room card: full screen below lg, arrows between rooms, "Kitchen, 2 of 4". */
export function RoomDialogShell({ rooms, room, onRoomChange, onClose, describe, children }: RoomDialogShellProps) {
  const index = room ? rooms.indexOf(room) : -1;
  const move = (step: number) => {
    const next = rooms[index + step];
    if (next) onRoomChange(next);
  };

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const target = event.target as HTMLElement;
    // Arrow keys belong to text fields, selects, tabs and nested dialogs.
    if (target.closest('input, textarea, [role=combobox], [role=listbox], [role=tablist]') || target.closest('[role=dialog]') !== event.currentTarget) return;
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }

  const total = rooms.length;
  const position = index + 1;
  const name = room ? roomLabels[room] : '';
  return (
    <Dialog open={room !== null && index >= 0} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onKeyDown={onKeyDown}
        className="top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-none lg:top-1/2 lg:left-1/2 lg:h-5/6 lg:max-w-6xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl"
      >
        {room && (
          <>
            <div className="flex items-center gap-2 border-b py-3 pr-14 pl-4">
              {total > 1 && (
                <Button variant="secondary" size="icon" aria-label="Previous room" disabled={position === 1} onClick={() => move(-1)}>
                  <ChevronLeftIcon />
                </Button>
              )}
              <DialogTitle className="text-heading">{total > 1 ? `${name}, ${position} of ${total}` : name}</DialogTitle>
              {total > 1 && (
                <Button variant="secondary" size="icon" aria-label="Next room" disabled={position === total} onClick={() => move(1)}>
                  <ChevronRightIcon />
                </Button>
              )}
              <DialogDescription className="sr-only">{describe(name.toLowerCase())} Press Escape to close.</DialogDescription>
            </div>
            <div key={room} className="flex min-h-0 flex-1 flex-col">
              {children(room)}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type RoomDialogProps = Omit<RoomDialogShellProps, 'describe' | 'children'> & {
  photos: Photo[];
  checks: RoomCheck[];
  analyzing?: boolean;
  disabled?: boolean;
  onRelabel: (photo: Photo, room: Room) => void;
  onDeletePhoto: (photo: Photo) => void;
  onAddCheck: (text: string) => Promise<unknown>;
  onDeleteCheck: (check: RoomCheck) => void;
};

export function RoomDialog({ rooms, room, onRoomChange, onClose, ...content }: RoomDialogProps) {
  return (
    <RoomDialogShell rooms={rooms} room={room} onRoomChange={onRoomChange} onClose={onClose} describe={(name) => `Photos and room checks for the ${name}.`}>
      {(open) => <RoomDialogBody room={open} {...content} />}
    </RoomDialogShell>
  );
}

type BodyProps = Omit<RoomDialogProps, 'rooms' | 'room' | 'onRoomChange' | 'onClose'> & { room: Room };

function RoomDialogBody({ room, photos, checks, analyzing, disabled, onRelabel, onDeletePhoto, onAddCheck, onDeleteCheck }: BodyProps) {
  const inRoom = photos.filter((photo) => photo.room === room);
  const [selected, setSelected] = useState(0);
  const current = inRoom[Math.min(selected, inRoom.length - 1)];
  const name = roomLabels[room];

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="flex flex-col gap-3 p-4 lg:w-1/2 lg:overflow-y-auto">
          {current && (
            <>
              <EnlargeablePhoto photo={current} label={`${name} photo ${inRoom.indexOf(current) + 1} of ${inRoom.length}`} className="w-full" />
              {inRoom.length > 1 && (
                <ul className="flex flex-wrap gap-2">
                  {inRoom.map((photo, photoIndex) => (
                    <li key={photo.id}>
                      <button
                        type="button"
                        aria-label={`Show ${name} photo ${photoIndex + 1}`}
                        aria-current={photo === current}
                        onClick={() => setSelected(photoIndex)}
                        className={cn(
                          'block w-20 overflow-hidden rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                          photo === current && 'ring-2 ring-primary',
                        )}
                      >
                        <img src={photo.url} alt="" className="aspect-4/3 w-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <RoomSelect value={current.room} onValueChange={(next) => onRelabel(current, next)} label={`Room for ${name} photo`} disabled={disabled} />
                </div>
                <Button variant="secondary" size="icon" aria-label={`Delete ${name} photo`} disabled={disabled} onClick={() => onDeletePhoto(current)}>
                  <Trash2Icon />
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="bg-surface p-4 lg:w-1/2 lg:overflow-y-auto">
          <RoomCheckList room={room} checks={checks.filter((check) => check.room === room)} analyzing={analyzing} disabled={disabled} onAdd={onAddCheck} onDelete={onDeleteCheck} />
        </div>
      </div>
    </>
  );
}
