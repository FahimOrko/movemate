import { roomLabels, type Room } from '@movemate/contracts';
import { CheckCheckIcon, ScanSearchIcon } from 'lucide-react';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api';
import type { useRunCompare } from './use-findings';

const roomList = (rooms: Room[]) => rooms.map((room) => roomLabels[room]).join(', ');

type CompareControlsProps = {
  compare: ReturnType<typeof useRunCompare>;
  comparableCount: number;
  hasAiFindings: boolean;
  pendingLooksGoodCount: number;
  busy: boolean;
  onMarkAllOk: () => void;
  actionError?: Error | null;
};

export function CompareControls({ compare, comparableCount, hasAiFindings, pendingLooksGoodCount, busy, onMarkAllOk, actionError }: CompareControlsProps) {
  const failedRooms = compare.data?.failedRooms ?? [];
  const skippedRooms = compare.data?.skippedRooms ?? [];
  const notConfigured = compare.error instanceof ApiError && compare.error.code === 'ai_not_configured';

  return (
    <section aria-label="Compare photos" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => compare.mutate(undefined)} disabled={comparableCount === 0 || compare.isPending}>
          {compare.isPending ? <Spinner data-icon="inline-start" /> : <ScanSearchIcon data-icon="inline-start" />}
          {compare.isPending ? 'Comparing' : hasAiFindings ? 'Re-run comparison (clears your answers for these rooms)' : 'Compare photos'}
        </Button>
        {pendingLooksGoodCount > 0 && (
          <Button variant="secondary" disabled={busy} onClick={onMarkAllOk}>
            <CheckCheckIcon data-icon="inline-start" />
            Mark all looks good as OK
          </Button>
        )}
      </div>
      <p className="max-w-prose text-sm text-muted-foreground" aria-live="polite">
        {compare.isPending
          ? `Comparing ${comparableCount} ${comparableCount === 1 ? 'room' : 'rooms'}. This can take a few minutes.`
          : comparableCount === 0
            ? 'Add before and move-in photos of the same room to compare them.'
            : 'The AI points out differences it can see. It can miss things, and you decide what each finding means.'}
      </p>

      {compare.isError && (
        <AiErrorAlert
          title={notConfigured ? 'AI is not set up' : 'The AI could not compare your photos'}
          message={notConfigured ? 'Add the problems you see by hand in each room.' : `${compare.error.message} Your findings are unchanged, so you can also add problems by hand.`}
          onRetry={notConfigured ? undefined : () => compare.mutate(undefined)}
          retrying={compare.isPending}
        />
      )}
      {compare.isSuccess && failedRooms.length > 0 && (
        <AiErrorAlert
          title="Some rooms could not be compared"
          message={`${roomList(failedRooms)} failed. The other rooms were saved.`}
          onRetry={() => compare.mutate(failedRooms)}
          retrying={compare.isPending}
        />
      )}
      {compare.isSuccess && skippedRooms.length > 0 && (
        <p className="text-sm text-muted-foreground">Skipped {roomList(skippedRooms)}: a room needs both before and move-in photos to be compared.</p>
      )}
      {actionError && <AiErrorAlert title="That did not work" message={actionError.message} />}
    </section>
  );
}
