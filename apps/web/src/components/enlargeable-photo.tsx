import type { Photo } from '@movemate/contracts';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type EnlargeablePhotoProps = {
  photo: Photo;
  /** Describes the photo for screen readers and as the dialog title, for example "Before photo of the kitchen". */
  label: string;
  /** Sizes the thumbnail button; defaults to a small 96px thumbnail. */
  className?: string;
};

export function EnlargeablePhoto({ photo, label, className }: EnlargeablePhotoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Enlarge: ${label}`}
          className={cn('w-24 overflow-hidden rounded-lg border bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)}
        >
          <img src={photo.url} alt={label} loading="lazy" className="aspect-4/3 size-full object-cover" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogTitle>{label}</DialogTitle>
        <DialogDescription className="sr-only">Enlarged photo. Press Escape to close.</DialogDescription>
        <img src={photo.url} alt={label} className="max-h-[70vh] w-full rounded-lg object-contain" />
      </DialogContent>
    </Dialog>
  );
}
