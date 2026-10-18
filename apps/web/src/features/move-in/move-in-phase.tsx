import type { Move } from '@movemate/contracts';
import { GenerateReportButton } from './generate-report-button';
import { MoveInBoard } from './move-in-board';

export function MoveInPhase({ move }: { move: Move }) {
  return (
    <section aria-labelledby="move-in-title" className="flex flex-col gap-6">
      <div>
        <h1 id="move-in-title" className="text-title">
          Move-in photos
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">Photograph each room again on move-in day, then check it and note any problems.</p>
      </div>
      <MoveInBoard move={move} />
      <GenerateReportButton move={move} />
    </section>
  );
}
