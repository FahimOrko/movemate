import { roomSchema, type Move, type Room, roomLabels } from '@movemate/contracts';
import { ImageIcon, SparklesIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { RoomCard } from '@/components/room-card';
import { RoomDialog } from '@/components/room-dialog';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { usePhotoActions, usePhotos } from '@/features/photos/use-photos';
import { useAdvanceMove } from '@/features/prepare/use-move';
import { ApiError } from '@/lib/api';
import { useAddRoomCheck, useDeleteRoomCheck, useRoomChecks, useRunBaseline } from './use-room-checks';

export function BaselinePanel({ move }: { move: Move }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const photos = usePhotos(move.id, 'before');
  const { relabel, remove } = usePhotoActions(move.id, 'before');
  const checks = useRoomChecks(move.id);
  const baseline = useRunBaseline(move.id);
  const addCheck = useAddRoomCheck(move.id);
  const deleteCheck = useDeleteRoomCheck(move.id);
  const advance = useAdvanceMove();

  const photoRooms = roomSchema.options.filter((room) => photos.data?.some((photo) => photo.room === room));
  const hasPhotos = photoRooms.length > 0;
  const roomParam = roomSchema.safeParse(searchParams.get('room'));
  const openRoom = roomParam.success && photoRooms.includes(roomParam.data) ? roomParam.data : null;
  const failedRooms = baseline.data?.failedRooms ?? [];
  const notConfigured = baseline.error instanceof ApiError && baseline.error.code === 'ai_not_configured';

  function runBaseline(rooms?: Room[]) {
    baseline.mutate(rooms);
  }

  const isAnalyzing = (room: Room) => baseline.isPending && (baseline.variables?.includes(room) ?? true);

  function openCard(room: Room | null, replace = false) {
    setSearchParams(room ? { room } : {}, { replace });
  }

  function continueToMoveIn() {
    if (move.phase !== 'before_photos') return navigate('/move/move_in');
    advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) });
  }

  return (
    <section aria-labelledby="checks-title" className="flex flex-col gap-6">
      <div>
        <h2 id="checks-title" className="text-heading">
          Room checks
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">What to look for on move-in day, room by room.</p>
      </div>

      {hasPhotos ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photoRooms.map((room) => (
            <li key={room}>
              <RoomCard
                room={room}
                photos={(photos.data ?? []).filter((photo) => photo.room === room)}
                checkCount={(checks.data ?? []).filter((check) => check.room === room).length}
                aiCheckCount={(checks.data ?? []).filter((check) => check.room === room && check.source === 'ai').length}
                analyzing={isAnalyzing(room)}
                failed={baseline.isSuccess && failedRooms.includes(room)}
                onOpen={() => openCard(room)}
                onRetry={() => runBaseline([room])}
              />
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>No rooms yet</EmptyTitle>
            <EmptyDescription>Add before photos above. Each room gets its own card with its checks.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

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
              : 'The AI only describes what is visible and cannot tell you a room is in good condition. Remove what does not fit and add your own.'}
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
      {(checks.isError || addCheck.isError || deleteCheck.isError || relabel.isError || remove.isError) && (
        <AiErrorAlert title="That did not work" message={(addCheck.error ?? deleteCheck.error ?? relabel.error ?? remove.error ?? checks.error)?.message ?? 'Try again.'} />
      )}

      <RoomDialog
        rooms={photoRooms}
        room={openRoom}
        onRoomChange={(room) => openCard(room, true)}
        onClose={() => openCard(null)}
        photos={photos.data ?? []}
        checks={checks.data ?? []}
        analyzing={openRoom ? isAnalyzing(openRoom) : false}
        disabled={deleteCheck.isPending || relabel.isPending || remove.isPending}
        onRelabel={(photo, room) => relabel.mutate({ id: photo.id, room })}
        onDeletePhoto={(photo) => remove.mutate(photo.id)}
        onAddCheck={(text) => addCheck.mutateAsync({ room: openRoom ?? 'other', text })}
        onDeleteCheck={(check) => deleteCheck.mutate(check.id)}
      />

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
