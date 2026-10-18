import { roomSchema, type Move, type Room } from '@movemate/contracts';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { AddRoomCard } from '@/components/add-room-card';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { MoveInRoomCard } from '@/components/move-in-room-card';
import { OpenItemsStatus } from '@/components/open-items-status';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoomChecks } from '@/features/before-photos/use-room-checks';
import { PhotosPanel } from '@/features/photos/photos-panel';
import { usePhotos } from '@/features/photos/use-photos';
import { CompareControls } from './compare-controls';
import { MoveInRoomDialog, type RoomTab } from './move-in-room-dialog';
import { countOpenMoveIn } from './open-items';
import { useFindings, useResolveFinding, useRunCompare } from './use-findings';

export function MoveInBoard({ move }: { move: Move }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<RoomTab>('photos');
  const before = usePhotos(move.id, 'before');
  const moveIn = usePhotos(move.id, 'move_in');
  const checks = useRoomChecks(move.id);
  const findings = useFindings(move.id);
  const compare = useRunCompare(move.id);
  const resolve = useResolveFinding(move.id);

  const loadError = before.error ?? moveIn.error ?? checks.error ?? findings.error;
  const loaded = before.data && moveIn.data && checks.data && findings.data;
  const beforePhotos = before.data ?? [];
  const moveInPhotos = moveIn.data ?? [];
  const allChecks = checks.data ?? [];
  const allFindings = findings.data ?? [];

  const inRoom = <T extends { room: Room }>(items: T[], room: Room) => items.filter((item) => item.room === room);
  const hasAnything = (room: Room) =>
    inRoom(beforePhotos, room).length + inRoom(moveInPhotos, room).length + inRoom(allChecks, room).length + inRoom(allFindings, room).length > 0;
  const cardRooms = roomSchema.options.filter(hasAnything);
  const emptyRooms = roomSchema.options.filter((room) => !hasAnything(room));
  const comparableRooms = cardRooms.filter((room) => inRoom(beforePhotos, room).length > 0 && inRoom(moveInPhotos, room).length > 0);

  const roomParam = roomSchema.safeParse(searchParams.get('room'));
  const openRoom = roomParam.success ? roomParam.data : null;
  const dialogRooms = roomSchema.options.filter((room) => cardRooms.includes(room) || room === openRoom);

  const failedRooms = compare.isSuccess ? compare.data.failedRooms : [];
  const isComparing = (room: Room) => compare.isPending && comparableRooms.includes(room) && (compare.variables?.includes(room) ?? true);
  const open = countOpenMoveIn(allChecks, allFindings);
  const pendingLooksGood = allFindings.filter((finding) => finding.aiStatus === 'looks_good' && finding.resolution === 'pending');

  function openCard(room: Room | null, replace = false) {
    setSearchParams(room ? { room } : {}, { replace });
  }

  async function markLooksGoodAsOk() {
    await Promise.allSettled(pendingLooksGood.map((finding) => resolve.mutateAsync({ id: finding.id, body: { resolution: 'ok' } })));
  }

  return (
    <div className="flex flex-col gap-6">
      {loaded ? <OpenItemsStatus openChecks={open.openChecks} openFindings={open.openFindings} /> : <Skeleton className="h-7 w-72 max-w-full" aria-hidden="true" />}
      <PhotosPanel moveId={move.id} stage="move_in" uploadOnly />
      {loadError && <AiErrorAlert title="Could not load this screen" message="Refresh the page to try again." />}

      {loaded ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cardRooms.map((room) => {
            const roomChecks = inRoom(allChecks, room);
            return (
              <li key={room}>
                <MoveInRoomCard
                  room={room}
                  beforePhotos={inRoom(beforePhotos, room)}
                  moveInPhotos={inRoom(moveInPhotos, room)}
                  problemCount={inRoom(allFindings, room).filter((finding) => finding.resolution === 'issue').length}
                  checkedCount={roomChecks.filter((check) => check.status !== 'pending').length}
                  checkTotal={roomChecks.length}
                  comparing={isComparing(room)}
                  failed={failedRooms.includes(room)}
                  onRetry={() => compare.mutate([room])}
                  onOpen={() => {
                    setTab('photos');
                    openCard(room);
                  }}
                />
              </li>
            );
          })}
          {emptyRooms.length > 0 && (
            <li>
              <AddRoomCard
                rooms={emptyRooms}
                onPick={(room) => {
                  setTab('photos');
                  openCard(room);
                }}
              />
            </li>
          )}
        </ul>
      ) : (
        !loadError && <Skeleton className="h-48 w-full rounded-xl" aria-hidden="true" />
      )}

      <CompareControls
        compare={compare}
        comparableCount={comparableRooms.length}
        hasAiFindings={allFindings.some((finding) => finding.source === 'ai')}
        pendingLooksGoodCount={pendingLooksGood.length}
        busy={resolve.isPending}
        onMarkAllOk={markLooksGoodAsOk}
        actionError={resolve.error}
      />

      <MoveInRoomDialog
        move={move}
        rooms={dialogRooms}
        room={openRoom}
        onRoomChange={(room) => openCard(room, true)}
        onClose={() => openCard(null)}
        tab={tab}
        onTabChange={setTab}
        comparing={openRoom ? isComparing(openRoom) : false}
      />
    </div>
  );
}
