import { type Photo, type Room, roomLabels } from '@movemate/contracts';
import { CheckIcon, CircleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type RoomCardProps = {
  room: Room;
  photos: Photo[];
  checkCount: number;
  /** Checks the AI wrote for this room; above zero the card shows Analyzed. */
  aiCheckCount?: number;
  onOpen: () => void;
  /** Shows a placeholder badge while the AI works on this room. */
  analyzing?: boolean;
  /** Shows the failed state with a per-room retry. */
  failed?: boolean;
  onRetry?: () => void;
  /** Replaces the default badges, for screens that count something other than checks. */
  badges?: ReactNode;
  /** Overrides the cover, which is otherwise the first photo. */
  cover?: Photo;
  /** Names the failed state in the retry footer. */
  failedLabel?: string;
};

export function RoomCard({ room, photos, checkCount, aiCheckCount = 0, onOpen, analyzing, failed, onRetry, badges, cover = photos[0], failedLabel = 'Could not analyze' }: RoomCardProps) {
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
        <span className="flex flex-col gap-2 p-3">
          <span className="font-medium wrap-break-word">{name}</span>
          <span className="flex flex-wrap items-center gap-2">
            {analyzing ? (
              <>
                <Skeleton className="h-5 w-16 rounded-4xl" aria-hidden="true" />
                <span className="sr-only">Analyzing</span>
              </>
            ) : failed ? (
              <Badge variant="destructive">Failed</Badge>
            ) : (
              (badges ?? (
                <>
                  {extra > 0 && <Badge variant="outline">{`+${extra} ${extra === 1 ? 'photo' : 'photos'}`}</Badge>}
                  <Badge variant="secondary">{checkCount === 0 ? 'No checks yet' : `${checkCount} ${checkCount === 1 ? 'check' : 'checks'}`}</Badge>
                  {aiCheckCount > 0 && (
                    <Badge variant="success">
                      <CheckIcon aria-hidden="true" />
                      Analyzed
                    </Badge>
                  )}
                </>
              ))
            )}
          </span>
        </span>
      </button>
      {failed && (
        <div className="flex items-center gap-2 border-t p-3">
          <CircleAlertIcon className="size-4 shrink-0 text-destructive-text" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-destructive-text">{failedLabel}</p>
          <Button variant="secondary" size="sm" onClick={onRetry} aria-label={`Try again: ${name}`}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
