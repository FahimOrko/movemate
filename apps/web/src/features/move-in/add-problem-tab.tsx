import type { Finding, Room } from '@movemate/contracts';
import { AddFindingForm } from '@/components/add-finding-form';
import { FindingRow } from '@/components/finding-row';

type AddProblemTabProps = {
  room: Room;
  /** The user's own problems for this room that are not tied to a room check. */
  problems: Finding[];
  onAdd: (note: string, files: File[]) => Promise<unknown>;
  onDelete: (finding: Finding) => void;
  disabled?: boolean;
};

export function AddProblemTab({ room, problems, onAdd, onDelete, disabled }: AddProblemTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <AddFindingForm room={room} allowPhotos onAdd={onAdd} disabled={disabled} />
      {problems.length > 0 && (
        <section aria-label="Your problems" className="flex flex-col gap-1">
          <h3 className="text-heading">Your problems</h3>
          <ul className="divide-y">
            {problems.map((problem) => (
              <FindingRow key={problem.id} finding={problem} disabled={disabled} onResolve={() => Promise.resolve()} onDelete={onDelete} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
