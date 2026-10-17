import { roomLabels, roomSchema, type Finding, type Move, type Room } from '@movemate/contracts';
import { CheckCheckIcon, ScanSearchIcon } from 'lucide-react';
import { AddFindingForm } from '@/components/add-finding-form';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { FindingRow } from '@/components/finding-row';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { usePhotos } from '@/features/photos/use-photos';
import { ApiError } from '@/lib/api';
import { useAddFinding, useDeleteFinding, useFindings, useResolveFinding, useRunCompare } from './use-findings';

const roomList = (rooms: Room[]) => rooms.map((room) => roomLabels[room]).join(', ');

export function ComparePanel({ move }: { move: Move }) {
  const before = usePhotos(move.id, 'before');
  const moveIn = usePhotos(move.id, 'move_in');
  const findings = useFindings(move.id);
  const compare = useRunCompare(move.id);
  const resolve = useResolveFinding(move.id);
  const addFinding = useAddFinding(move.id);
  const deleteFinding = useDeleteFinding(move.id);

  const hasPhotos = (room: Room, photos: typeof before.data) => photos?.some((photo) => photo.room === room) ?? false;
  const comparableRooms = roomSchema.options.filter((room) => hasPhotos(room, before.data) && hasPhotos(room, moveIn.data));
  const visibleRooms = roomSchema.options.filter(
    (room) => comparableRooms.includes(room) || hasPhotos(room, moveIn.data) || findings.data?.some((finding) => finding.room === room),
  );
  const all = findings.data ?? [];
  const hasAiFindings = all.some((finding) => finding.source === 'ai');
  const resolvedCount = all.filter((finding) => finding.resolution !== 'pending').length;
  const pendingLooksGood = all.filter((finding) => finding.aiStatus === 'looks_good' && finding.resolution === 'pending');
  const failedRooms = compare.data?.failedRooms ?? [];
  const skippedRooms = compare.data?.skippedRooms ?? [];
  const notConfigured = compare.error instanceof ApiError && compare.error.code === 'ai_not_configured';
  const busy = resolve.isPending || deleteFinding.isPending;
  const actionError = resolve.error ?? addFinding.error ?? deleteFinding.error ?? findings.error;

  const roomFindings = (room: Room): Finding[] => all.filter((finding) => finding.room === room);
  const isComparing = (room: Room) => compare.isPending && comparableRooms.includes(room) && (compare.variables?.includes(room) ?? true);

  async function markLooksGoodAsOk() {
    await Promise.allSettled(pendingLooksGood.map((finding) => resolve.mutateAsync({ id: finding.id, body: { resolution: 'ok' } })));
  }

  return (
    <section aria-labelledby="compare-title" className="flex flex-col gap-6">
      <div>
        <h2 id="compare-title" className="text-heading">
          Compare with the before photos
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          The AI compares your before and move-in photos room by room and points out differences it can see. It can miss
          things and cannot tell you a room is in good condition. You decide what each finding means.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => compare.mutate(undefined)} disabled={comparableRooms.length === 0 || compare.isPending}>
          {compare.isPending ? <Spinner data-icon="inline-start" /> : <ScanSearchIcon data-icon="inline-start" />}
          {compare.isPending
            ? 'Comparing'
            : hasAiFindings
              ? 'Re-run comparison (clears your answers for these rooms)'
              : 'Compare photos'}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {compare.isPending
            ? `Comparing ${comparableRooms.length} ${comparableRooms.length === 1 ? 'room' : 'rooms'}. This can take a few minutes.`
            : comparableRooms.length === 0
              ? 'Add before and move-in photos of the same room to compare them.'
              : ''}
        </p>
      </div>

      {compare.isError && (
        <AiErrorAlert
          title={notConfigured ? 'AI is not set up' : 'The AI could not compare your photos'}
          message={
            notConfigured
              ? 'Add the issues you see by hand below.'
              : `${compare.error.message} Your findings are unchanged, so you can also add issues by hand.`
          }
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
        <p className="text-sm text-muted-foreground">
          Skipped {roomList(skippedRooms)}: a room needs both before and move-in photos to be compared.
        </p>
      )}
      {actionError && <AiErrorAlert title="That did not work" message={actionError.message} />}

      {all.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-heading" aria-live="polite">
            {resolvedCount} of {all.length} resolved
          </p>
          {pendingLooksGood.length > 0 && (
            <Button variant="secondary" disabled={busy} onClick={markLooksGoodAsOk}>
              <CheckCheckIcon data-icon="inline-start" />
              Mark all looks good as OK
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6">
        {visibleRooms.map((room) => {
          const inRoom = roomFindings(room);
          return (
            <Card key={room}>
              <CardHeader>
                <CardTitle>{roomLabels[room]}</CardTitle>
                <CardDescription>
                  {isComparing(room) ? 'Comparing the photos' : `${inRoom.length} ${inRoom.length === 1 ? 'finding' : 'findings'}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isComparing(room) ? (
                  <div className="flex flex-col gap-2" aria-hidden="true">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-5 w-2/3" />
                  </div>
                ) : inRoom.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No findings yet. Compare the photos or add an issue below.</p>
                ) : (
                  <ul className="divide-y">
                    {inRoom.map((finding) => (
                      <FindingRow
                        key={finding.id}
                        finding={finding}
                        disabled={busy}
                        onResolve={(body) => resolve.mutateAsync({ id: finding.id, body })}
                        onDelete={(target) => deleteFinding.mutate(target.id)}
                      />
                    ))}
                  </ul>
                )}
                <AddFindingForm room={room} onAdd={(note) => addFinding.mutateAsync({ room, note })} disabled={busy} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
