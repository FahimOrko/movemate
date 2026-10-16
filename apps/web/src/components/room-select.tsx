import { roomSchema, type Room } from '@movemate/contracts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roomLabels } from '@/lib/rooms';

type RoomSelectProps = {
  value: Room;
  onValueChange: (room: Room) => void;
  label: string;
  disabled?: boolean;
};

export function RoomSelect({ value, onValueChange, label, disabled }: RoomSelectProps) {
  return (
    <Select value={value} onValueChange={(room) => onValueChange(roomSchema.parse(room))} disabled={disabled}>
      <SelectTrigger size="sm" aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roomSchema.options.map((room) => (
          <SelectItem key={room} value={room}>
            {roomLabels[room]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
