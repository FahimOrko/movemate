import { type Photo, type Room, roomLabels } from '@movemate/contracts';
import { CircleAlertIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type RoomCardProps = {
  room: Room;
  photos: Photo[];
  checkCount: number;
  onOpen: () => void;
  /** Shows a placeholder badge while the AI works on this room. */
  analyzing?: boolean;
  /** Shows the failed state with a per-room retry. */
  failed?: boolean;
  onRetry?: () => void;
};

export function RoomCard({ room, photos, checkCount, onOpen, analyzing, failed, onRetry }: RoomCardProps) {
  const cover = photos[0];
  const extra = photos.length - 1;
  const name = roomLabels[room];
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border bg-card', failed && 'border-destructive')}>
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
      >
        <span className="relative block bg-surface">
          {cover && <img src={cover.url} alt={`${name} cover photo`} loading="lazy" className="aspect-4/3 w-full object-cover" />}
        </span>
        <span className="flex flex-wrap items-center gap-2 p-3">
          <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
          {extra > 0 && <Badge variant="outline">{`+${extra} ${extra === 1 ? 'photo' : 'photos'}`}</Badge>}
          {analyzing ? (
            <Skeleton className="h-5 w-16 rounded-4xl" aria-hidden="true" />
          ) : (
            <Badge variant={failed ? 'destructive' : 'secondary'}>
              {failed ? 'Failed' : checkCount === 0 ? 'No checks yet' : `${checkCount} ${checkCount === 1 ? 'check' : 'checks'}`}
            </Badge>
          )}
          {analyzing && <span className="sr-only">Analyzing</span>}
        </span>
      </button>
      {failed && (
        <div className="flex items-center gap-2 border-t p-3">
          <CircleAlertIcon className="size-4 shrink-0 text-destructive-text" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-destructive-text">Could not analyze</p>
          <Button variant="secondary" size="sm" onClick={onRetry} aria-label={`Try again: ${name}`}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
