import type { Photo, Room } from '@movemate/contracts';
import { RoomCard } from '@/components/room-card';
import { Badge } from '@/components/ui/badge';

type MoveInRoomCardProps = {
  room: Room;
  beforePhotos: Photo[];
  moveInPhotos: Photo[];
  problemCount: number;
  checkedCount: number;
  checkTotal: number;
  onOpen: () => void;
  comparing?: boolean;
  failed?: boolean;
  onRetry?: () => void;
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function MoveInRoomCard({ room, beforePhotos, moveInPhotos, problemCount, checkedCount, checkTotal, onOpen, comparing, failed, onRetry }: MoveInRoomCardProps) {
  const badges = (
    <>
      <Badge variant="secondary">{`${beforePhotos.length} before, ${moveInPhotos.length} move-in`}</Badge>
      {problemCount > 0 && <Badge variant="warning">{plural(problemCount, 'problem', 'problems')}</Badge>}
      {checkTotal > 0 && <Badge variant={checkedCount === checkTotal ? 'success' : 'outline'}>{`${checkedCount} of ${checkTotal} checked`}</Badge>}
      {beforePhotos.length === 0 && <Badge variant="outline">No before photos, not compared</Badge>}
    </>
  );
  return (
    <RoomCard
      room={room}
      photos={[...moveInPhotos, ...beforePhotos]}
      cover={moveInPhotos[0] ?? beforePhotos[0]}
      checkCount={checkTotal}
      badges={badges}
      analyzing={comparing}
      failed={failed}
      failedLabel="Could not compare"
      onRetry={onRetry}
      onOpen={onOpen}
    />
  );
}
