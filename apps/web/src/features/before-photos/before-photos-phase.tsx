import type { Move } from '@movemate/contracts';
import { PhotosPanel } from '@/features/photos/photos-panel';

export function BeforePhotosPhase({ move }: { move: Move }) {
  return (
    <section aria-labelledby="before-photos-title" className="flex flex-col gap-8">
      <div>
        <h1 id="before-photos-title" className="text-title">
          Before photos
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Add the listing or viewing photos and label each by room. Up to 4 photos per room.
        </p>
      </div>
      <PhotosPanel moveId={move.id} stage="before" />
    </section>
  );
}
