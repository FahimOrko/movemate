import type { Move } from '@movemate/contracts';
import { PhotosPanel } from '@/features/photos/photos-panel';
import { ComparePanel } from './compare-panel';
import { GenerateReportButton } from './generate-report-button';

export function MoveInPhase({ move }: { move: Move }) {
  return (
    <section aria-labelledby="move-in-title" className="flex flex-col gap-8">
      <div>
        <h1 id="move-in-title" className="text-title">
          Move-in photos
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Photograph each room again on move-in day and label it. Up to 4 photos per room.
        </p>
      </div>
      <PhotosPanel moveId={move.id} stage="move_in" />
      <ComparePanel move={move} />
      <GenerateReportButton move={move} />
    </section>
  );
}
