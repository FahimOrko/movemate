import type { Photo } from '@movemate/contracts';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type EnlargeablePhotoProps = {
  photo: Photo;
  /** Describes the photo for screen readers and as the dialog title, for example "Before photo of the kitchen". */
  label: string;
};

export function EnlargeablePhoto({ photo, label }: EnlargeablePhotoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Enlarge: ${label}`}
          className="overflow-hidden rounded-lg border bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <img src={photo.url} alt={label} loading="lazy" className="aspect-4/3 w-24 object-cover" />
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
