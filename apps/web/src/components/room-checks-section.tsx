import { roomSchema, type RoomCheck, roomLabels } from '@movemate/contracts';
import { ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router';

type RoomChecksSectionProps = {
  checks: RoomCheck[];
  /** Called when a room link is followed, for example to close the drawer. */
  onNavigate?: () => void;
};

export function RoomChecksSection({ checks, onNavigate }: RoomChecksSectionProps) {
  const groups = roomSchema.options
    .map((room) => ({ room, count: checks.filter((check) => check.room === room).length }))
    .filter((group) => group.count > 0);
  if (groups.length === 0) return null;

  return (
    <details className="group border-t pt-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md text-heading outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon className="size-4 transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true" />
        Room checks
        <span className="text-sm font-normal text-muted-foreground">{checks.length}</span>
      </summary>
      <ul className="mt-2 divide-y">
        {groups.map(({ room, count }) => (
          <li key={room}>
            <Link
              to={`/move/before_photos?room=${room}`}
              onClick={onNavigate}
              className="flex items-center justify-between gap-3 rounded-md py-2.5 text-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span>{roomLabels[room]}</span>
              <span className="text-muted-foreground">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
