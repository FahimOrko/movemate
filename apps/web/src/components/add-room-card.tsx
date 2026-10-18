import { type Room, roomLabels } from '@movemate/contracts';
import { PlusIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AddRoomCardProps = {
  /** Rooms that have no photos, problems or checks yet. */
  rooms: Room[];
  onPick: (room: Room) => void;
};

export function AddRoomCard({ rooms, onPick }: AddRoomCardProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface p-4 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PlusIcon className="size-5" aria-hidden="true" />
      </span>
      <p className="font-medium">Add a room</p>
      <p className="text-sm text-muted-foreground">Note a problem in a room that has no photos yet.</p>
      <Select value="" onValueChange={(room) => onPick(room as Room)} disabled={rooms.length === 0}>
        <SelectTrigger size="sm" aria-label="Add a room" className="w-full max-w-48">
          <SelectValue placeholder="Choose a room" />
        </SelectTrigger>
        <SelectContent>
          {rooms.map((room) => (
            <SelectItem key={room} value={room}>
              {roomLabels[room]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
