import type { Photo } from '@movemate/contracts';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type ReportPhotoGridProps = {
  beforePhotos: Photo[];
  moveInPhotos: Photo[];
  roomLabel: string;
  /** Print shows only this many photos per stage and a "+N more photos" line. */
  printLimit?: number;
  /** Adds the upload time to Before captions (the move-in caption always has it). */
  showBeforeTime?: boolean;
};

function caption(photo: Photo, showBeforeTime: boolean) {
  const uploaded = formatDateTime(photo.createdAt);
  if (photo.stage === 'move_in') return `Move-in, uploaded at ${uploaded}`;
  return showBeforeTime ? `Before (listing), uploaded at ${uploaded}` : 'Before (listing)';
}

export function ReportPhotoGrid({ beforePhotos, moveInPhotos, roomLabel, printLimit, showBeforeTime = false }: ReportPhotoGridProps) {
  const photos = [...beforePhotos, ...moveInPhotos];
  if (photos.length === 0) return null;
  const overLimit = (list: Photo[]) => (printLimit === undefined ? 0 : Math.max(list.length - printLimit, 0));
  const hidden = overLimit(beforePhotos) + overLimit(moveInPhotos);
  const hiddenIds = new Set<string>();
  if (printLimit !== undefined) for (const list of [beforePhotos, moveInPhotos]) for (const photo of list.slice(printLimit)) hiddenIds.add(photo.id);
  return (
    <div className="flex flex-col gap-2">
      <ul aria-label={`Photos of the ${roomLabel}`} className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id} className={cn('min-w-0', hiddenIds.has(photo.id) && 'print:hidden')}>
            <figure className="flex flex-col gap-1">
              <EnlargeablePhoto
                photo={photo}
                label={`${photo.stage === 'move_in' ? 'Move-in' : 'Before (listing)'} photo of the ${roomLabel}`}
                className="w-full"
              />
              <figcaption className="text-xs text-muted-foreground">{caption(photo, showBeforeTime)}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {hidden > 0 && <p className="hidden text-xs text-muted-foreground print:block">+{hidden} more photos</p>}
    </div>
  );
}
