import { roomSchema, type Move, type Room, roomLabels } from '@movemate/contracts';
import { SparklesIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { RoomCheckList } from '@/components/room-check-list';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePhotos } from '@/features/photos/use-photos';
import { useAdvanceMove } from '@/features/prepare/use-move';
import { ApiError } from '@/lib/api';
import { useAddRoomCheck, useDeleteRoomCheck, useRoomChecks, useRunBaseline } from './use-room-checks';

export function BaselinePanel({ move }: { move: Move }) {
  const navigate = useNavigate();
  const photos = usePhotos(move.id, 'before');
  const checks = useRoomChecks(move.id);
  const baseline = useRunBaseline(move.id);
  const addCheck = useAddRoomCheck(move.id);
  const deleteCheck = useDeleteRoomCheck(move.id);
  const advance = useAdvanceMove();

  const photoRooms = roomSchema.options.filter((room) => photos.data?.some((photo) => photo.room === room));
  const hasPhotos = photoRooms.length > 0;
  const failedRooms = baseline.data?.failedRooms ?? [];
  const notConfigured = baseline.error instanceof ApiError && baseline.error.code === 'ai_not_configured';

  function runBaseline(rooms?: Room[]) {
    baseline.mutate(rooms);
  }

  function continueToMoveIn() {
    if (move.phase !== 'before_photos') return navigate('/move/move_in');
    advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) });
  }

  return (
    <section aria-labelledby="checks-title" className="flex flex-col gap-6">
      <div>
        <h2 id="checks-title" className="text-heading">
          Things to check on move-in day
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          The AI reads your photos and suggests what to look at, room by room. It only describes what is visible and
          cannot tell you a room is in good condition. Remove what does not fit and add your own.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => runBaseline()} disabled={!hasPhotos || baseline.isPending}>
          {baseline.isPending ? <Spinner data-icon="inline-start" /> : <SparklesIcon data-icon="inline-start" />}
          {baseline.isPending ? 'Analyzing' : 'Analyze photos'}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {baseline.isPending
            ? `Analyzing ${photoRooms.length} ${photoRooms.length === 1 ? 'room' : 'rooms'}. This can take a minute or two.`
            : !hasPhotos
              ? 'Add before photos to analyze them.'
              : ''}
        </p>
      </div>

      {baseline.isError && (
        <AiErrorAlert
          title={notConfigured ? 'AI is not set up' : 'The AI could not analyze your photos'}
          message={
            notConfigured
              ? 'Add your checks by hand below, then continue.'
              : `${baseline.error.message} Your checks are unchanged, so you can also add them by hand.`
          }
          onRetry={notConfigured ? undefined : () => runBaseline()}
          retrying={baseline.isPending}
        />
      )}
      {baseline.isSuccess && failedRooms.length > 0 && (
        <AiErrorAlert
          title="Some rooms could not be analyzed"
          message={`${failedRooms.map((room) => roomLabels[room]).join(', ')} failed. The other rooms were saved.`}
          onRetry={() => runBaseline(failedRooms)}
          retrying={baseline.isPending}
        />
      )}
      {(checks.isError || addCheck.isError || deleteCheck.isError) && (
        <AiErrorAlert title="That did not work" message={(addCheck.error ?? deleteCheck.error ?? checks.error)?.message ?? 'Try again.'} />
      )}

      {hasPhotos && (
        <div className="grid gap-6 lg:grid-cols-2">
          {photoRooms.map((room) => (
            <RoomCheckList
              key={room}
              room={room}
              checks={(checks.data ?? []).filter((check) => check.room === room)}
              analyzing={baseline.isPending && (baseline.variables?.includes(room) ?? true)}
              disabled={deleteCheck.isPending}
              onAdd={(text) => addCheck.mutateAsync({ room, text })}
              onDelete={(check) => deleteCheck.mutate(check.id)}
            />
          ))}
        </div>
      )}

      {advance.isError && <AiErrorAlert title="Could not continue" message={advance.error.message} />}
      <div>
        <Button size="lg" onClick={continueToMoveIn} disabled={!hasPhotos || advance.isPending}>
          {advance.isPending && <Spinner data-icon="inline-start" />}
          Continue to move-in photos
        </Button>
      </div>
    </section>
  );
}
