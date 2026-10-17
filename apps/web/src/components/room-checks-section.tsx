import { roomSchema, type RoomCheck, roomLabels } from '@movemate/contracts';
import { ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

type RoomChecksSectionProps = {
  checks: RoomCheck[];
  /** Called when a room link is followed, for example to close the drawer. */
  onNavigate?: () => void;
  /** Pass both to make the section collapsible; the drawer omits them and stays expanded. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function RoomChecksSection({ checks, onNavigate, collapsed, onCollapsedChange }: RoomChecksSectionProps) {
  const groups = roomSchema.options
    .map((room) => ({ room, count: checks.filter((check) => check.room === room).length }))
    .filter((group) => group.count > 0);
  if (groups.length === 0) return null;

  const toggleable = onCollapsedChange !== undefined;
  const expanded = !(toggleable && collapsed);
  const heading = (
    <>
      Room checks
      <span className="text-sm font-normal text-muted-foreground">{checks.length}</span>
    </>
  );

  return (
    <section aria-label="Room checks" className="border-t pt-4">
      {toggleable ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse Room checks' : 'Expand Room checks'}
          onClick={() => onCollapsedChange(expanded)}
          className="flex w-full items-center gap-2 rounded-md text-left text-heading outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ChevronRightIcon className={cn('size-4 transition-transform motion-reduce:transition-none', expanded && 'rotate-90')} aria-hidden="true" />
          {heading}
        </button>
      ) : (
        <h3 className="flex items-center gap-2 text-heading">{heading}</h3>
      )}
      {expanded && (
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
      )}
    </section>
  );
}
