import type { Photo, Room, RoomCheck } from '@movemate/contracts';
import { useState } from 'react';
import { RoomDialog } from '@/components/room-dialog';
import { Button } from '@/components/ui/button';

type RoomDialogDemoProps = {
  label: string;
  rooms: Room[];
  photos: Photo[];
  checks: RoomCheck[];
  analyzing?: boolean;
};

export function RoomDialogDemo({ label, rooms, photos, checks, analyzing }: RoomDialogDemoProps) {
  const [room, setRoom] = useState<Room | null>(null);
  return (
    <>
      <Button variant="secondary" onClick={() => setRoom(rooms[0] ?? null)}>
        {label}
      </Button>
      <RoomDialog
        rooms={rooms}
        room={room}
        onRoomChange={setRoom}
        onClose={() => setRoom(null)}
        photos={photos}
        checks={checks}
        analyzing={analyzing}
        onRelabel={() => undefined}
        onDeletePhoto={() => undefined}
        onAddCheck={() => Promise.resolve()}
        onDeleteCheck={() => undefined}
      />
    </>
  );
}
