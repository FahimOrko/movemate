import type { RoomCheck } from '@movemate/contracts';
import { RoomCheckAnswer, type CheckAnswer } from '@/components/room-check-answer';

type RoomChecksTabProps = {
  checks: RoomCheck[];
  onAnswer: (check: RoomCheck, answer: CheckAnswer) => Promise<unknown>;
  onDelete: (check: RoomCheck) => void;
  disabled?: boolean;
};

export function RoomChecksTab({ checks, onAnswer, onDelete, disabled }: RoomChecksTabProps) {
  if (checks.length === 0) {
    return <p className="text-sm text-muted-foreground">No room checks for this room. Add them on the Before photos screen.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Answer each check. Problem lets you add a note and up to 3 photos.</p>
      <ul className="divide-y">
        {checks.map((check) => (
          <RoomCheckAnswer key={check.id} check={check} disabled={disabled} onAnswer={(answer) => onAnswer(check, answer)} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}
