import type { Photo } from '@movemate/contracts';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type ReportPhotoStripProps = {
  stage: Photo['stage'];
  photos: Photo[];
  roomLabel: string;
  /** Print shows only this many photos and a "+N more photos" line. */
  printLimit?: number;
};

const stageTitle = { before: 'Before (listing or viewing)', move_in: 'Move-in' } as const;

function caption(photo: Photo) {
  const uploaded = formatDateTime(photo.createdAt);
  if (photo.stage === 'move_in') return `Move-in, uploaded at ${uploaded}`;
  return (
    <>
      Before (listing or viewing)
      <br />
      Uploaded at {uploaded}
    </>
  );
}

export function ReportPhotoStrip({ stage, photos, roomLabel, printLimit }: ReportPhotoStripProps) {
  if (photos.length === 0) return null;
  const hidden = printLimit === undefined ? 0 : Math.max(photos.length - printLimit, 0);
  return (
    <ul aria-label={`${stageTitle[stage]} photos of the ${roomLabel}`} className="flex flex-wrap gap-3">
      {photos.map((photo, index) => (
        <li key={photo.id} className={cn('w-36 print:w-28', printLimit !== undefined && index >= printLimit && 'print:hidden')}>
          <figure className="flex flex-col gap-1">
            <EnlargeablePhoto photo={photo} label={`${stageTitle[stage]} photo of the ${roomLabel}`} className="w-full" />
            <figcaption className="text-xs text-muted-foreground">{caption(photo)}</figcaption>
          </figure>
        </li>
      ))}
      {hidden > 0 && <li className="hidden self-center text-xs text-muted-foreground print:block">+{hidden} more photos</li>}
    </ul>
  );
}
