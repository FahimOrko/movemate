import type { Move, Photo, Room, RoomCheck } from '@movemate/contracts';
import { RoomDialogShell } from '@/components/room-dialog';
import { MoveInPhotoStrips } from '@/components/move-in-photo-strips';
import type { CheckAnswer } from '@/components/room-check-answer';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnswerRoomCheck, useDeleteRoomCheck, useRoomChecks } from '@/features/before-photos/use-room-checks';
import { usePhotoActions, usePhotos } from '@/features/photos/use-photos';
import { AddProblemTab } from './add-problem-tab';
import { FindingsTab } from './findings-tab';
import { RoomChecksTab } from './room-checks-tab';
import { useAddFinding, useDeleteFinding, useFindings, useResolveFinding } from './use-findings';

const roomTabs = ['photos', 'checks', 'findings', 'problem'] as const;
export type RoomTab = (typeof roomTabs)[number];

type MoveInRoomDialogProps = {
  move: Move;
  rooms: Room[];
  room: Room | null;
  onRoomChange: (room: Room) => void;
  onClose: () => void;
  tab: RoomTab;
  onTabChange: (tab: RoomTab) => void;
  /** True while the AI compares this room. */
  comparing?: boolean;
};

export function MoveInRoomDialog({ move, rooms, room, onRoomChange, onClose, tab, onTabChange, comparing }: MoveInRoomDialogProps) {
  return (
    <RoomDialogShell rooms={rooms} room={room} onRoomChange={onRoomChange} onClose={onClose} describe={(name) => `Photos, room checks, findings and problems for the ${name}.`}>
      {(open) => <Body moveId={move.id} room={open} tab={tab} onTabChange={onTabChange} comparing={comparing} />}
    </RoomDialogShell>
  );
}

type BodyProps = { moveId: string; room: Room; tab: RoomTab; onTabChange: (tab: RoomTab) => void; comparing?: boolean };

function Body({ moveId, room, tab, onTabChange, comparing }: BodyProps) {
  const before = usePhotos(moveId, 'before').data ?? [];
  const moveIn = usePhotos(moveId, 'move_in').data ?? [];
  const { upload, relabel, remove } = usePhotoActions(moveId, 'move_in');
  const checks = useRoomChecks(moveId).data ?? [];
  const findings = useFindings(moveId).data ?? [];
  const answerCheck = useAnswerRoomCheck(moveId);
  const deleteCheck = useDeleteRoomCheck(moveId);
  const resolve = useResolveFinding(moveId);
  const addFinding = useAddFinding(moveId);
  const deleteFinding = useDeleteFinding(moveId);

  const roomBefore = before.filter((photo) => photo.room === room);
  const roomMoveIn = moveIn.filter((photo) => photo.room === room);
  const roomChecks = checks.filter((check) => check.room === room);
  const roomFindings = findings.filter((finding) => finding.room === room);
  const aiFindings = roomFindings.filter((finding) => finding.source === 'ai');
  const standalone = roomFindings.filter((finding) => finding.source === 'user' && finding.roomCheckId === null);
  const attachedIds = new Set(findings.filter((finding) => finding.source === 'user').flatMap((finding) => finding.moveInPhotos.map((photo) => photo.id)));
  const busy = relabel.isPending || remove.isPending || answerCheck.isPending || deleteCheck.isPending || resolve.isPending || addFinding.isPending || deleteFinding.isPending;
  const actionError = relabel.error ?? remove.error ?? answerCheck.error ?? deleteCheck.error ?? resolve.error ?? addFinding.error ?? deleteFinding.error;

  // Attached photos are uploaded as move-in photos of this room first, then linked to the problem.
  const uploadAttachments = (files: File[]): Promise<Photo[]> => Promise.all(files.map((file) => upload.mutateAsync({ file, room })));

  async function answer(check: RoomCheck, next: CheckAnswer) {
    if (next.status !== 'problem') return answerCheck.mutateAsync({ id: check.id, body: { status: next.status } });
    const added = await uploadAttachments(next.files);
    return answerCheck.mutateAsync({ id: check.id, body: { status: 'problem', note: next.note, photoIds: [...next.kept, ...added].map((photo) => photo.id) } });
  }

  async function addProblem(note: string, files: File[]) {
    const added = await uploadAttachments(files);
    return addFinding.mutateAsync({ room, note, photoIds: added.map((photo) => photo.id) });
  }

  return (
    <Tabs value={tab} onValueChange={(next) => roomTabs.filter((candidate) => candidate === next).forEach(onTabChange)} className="min-h-0 flex-1 gap-0">
      <div className="border-b px-4 py-2">
        <TabsList className="h-auto w-full flex-wrap group-data-horizontal/tabs:h-auto sm:w-fit">
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="checks">Room checks</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="problem">Add a problem</TabsTrigger>
        </TabsList>
      </div>
      {actionError && (
        <div className="px-4 pt-4">
          <AiErrorAlert title="That did not work" message={actionError.message} />
        </div>
      )}
      <TabsContent value="photos" className="min-h-0 overflow-y-auto p-4 text-base">
        <MoveInPhotoStrips
          room={room}
          beforePhotos={roomBefore}
          moveInPhotos={roomMoveIn}
          attachedIds={attachedIds}
          disabled={busy}
          onRelabel={(photo, next) => relabel.mutate({ id: photo.id, room: next })}
          onDelete={(photo) => remove.mutate(photo.id)}
          upload={(file, target) => upload.mutateAsync({ file, room: target })}
        />
      </TabsContent>
      <TabsContent value="checks" className="min-h-0 overflow-y-auto p-4 text-base">
        <RoomChecksTab checks={roomChecks} disabled={busy} onAnswer={answer} onDelete={(check) => deleteCheck.mutate(check.id)} />
      </TabsContent>
      <TabsContent value="findings" className="min-h-0 overflow-y-auto p-4 text-base">
        <FindingsTab findings={aiFindings} comparing={comparing} hasBeforePhotos={roomBefore.length > 0} disabled={busy} onResolve={(finding, body) => resolve.mutateAsync({ id: finding.id, body })} />
      </TabsContent>
      <TabsContent value="problem" className="min-h-0 overflow-y-auto p-4 text-base">
        <AddProblemTab room={room} problems={standalone} disabled={busy} onAdd={addProblem} onDelete={(finding) => deleteFinding.mutate(finding.id)} />
      </TabsContent>
    </Tabs>
  );
}
