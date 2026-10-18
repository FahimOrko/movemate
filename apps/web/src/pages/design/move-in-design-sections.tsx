import type { Finding, Phase, Photo, Room, RoomCheck } from '@movemate/contracts';
import { useState } from 'react';
import { AddRoomCard } from '@/components/add-room-card';
import { MoveInPhotoStrips } from '@/components/move-in-photo-strips';
import { MoveInRoomCard } from '@/components/move-in-room-card';
import { OpenItemsStatus } from '@/components/open-items-status';
import { RoomCheckAnswer } from '@/components/room-check-answer';
import { RoomChecksSection } from '@/components/room-checks-section';
import { Stepper, type StepState } from '@/components/stepper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddProblemTab } from '@/features/move-in/add-problem-tab';
import { FindingsTab } from '@/features/move-in/findings-tab';
import { RoomChecksTab } from '@/features/move-in/room-checks-tab';
import { DesignSection } from './design-section';

const moveId = '00000000-0000-4000-8000-000000000099';
const stamp = '2026-10-12T14:32:00.000Z';

const photo = (index: number, stage: Photo['stage'], room: Room): Photo => ({
  id: `00000000-0000-4000-8000-0000000004${String(index).padStart(2, '0')}`,
  moveId,
  stage,
  room,
  width: 800,
  height: 600,
  createdAt: stamp,
  url: `https://picsum.photos/seed/movemate-${stage}-${room}-${index}/400/300`,
});

const kitchenBefore = [photo(1, 'before', 'kitchen'), photo(2, 'before', 'kitchen'), photo(3, 'before', 'kitchen')];
const kitchenMoveIn = [4, 5, 6, 7, 8, 9].map((index) => photo(index, 'move_in', 'kitchen'));
const bathroomMoveIn = [photo(10, 'move_in', 'bathroom'), photo(11, 'move_in', 'bathroom')];
const hallwayBefore = [photo(12, 'before', 'hallway')];
const hallwayMoveIn = [photo(13, 'move_in', 'hallway')];

const check = (index: number, text: string, patch: Partial<RoomCheck> = {}): RoomCheck => ({
  id: `00000000-0000-4000-8000-0000000005${String(index).padStart(2, '0')}`,
  moveId,
  room: 'kitchen',
  text,
  source: 'ai',
  status: 'pending',
  problem: null,
  createdAt: stamp,
  ...patch,
});

const problemCheck = check(3, 'Check whether the tiles by the sink have cracks.', {
  status: 'problem',
  problem: { findingId: '00000000-0000-4000-8000-000000000601', note: 'Hairline crack in the second tile from the sink.', photos: kitchenMoveIn.slice(4, 6) },
});
const checks: RoomCheck[] = [
  check(1, 'Check whether the countertop edge left of the sink has chips or stains.'),
  check(2, 'Check whether the oven door seal appears intact along the lower edge.', { status: 'ok' }),
  problemCheck,
  check(4, 'Ask about the dishwasher filter.', { source: 'user', status: 'na' }),
];

const finding = (index: number, patch: Partial<Finding>): Finding => ({
  id: `00000000-0000-4000-8000-0000000006${String(index).padStart(2, '0')}`,
  moveId,
  room: 'kitchen',
  roomCheckId: null,
  checkText: null,
  source: 'ai',
  aiStatus: 'changed',
  aiSummary: 'A dark mark may be visible on the ceiling above the window in the move-in photos.',
  confidence: 'medium',
  resolution: 'pending',
  userNote: null,
  beforePhotos: kitchenBefore.slice(0, 1),
  moveInPhotos: kitchenMoveIn.slice(0, 1),
  createdAt: stamp,
  updatedAt: stamp,
  ...patch,
});

const aiFindings = [finding(1, {}), finding(2, { aiStatus: 'looks_good', aiSummary: 'The window frame looks the same in both photos.', resolution: 'ok' })];
const ownProblem = finding(3, {
  source: 'user',
  aiStatus: null,
  aiSummary: null,
  confidence: null,
  resolution: 'issue',
  userNote: 'Scratch on the door frame, about 10 cm long.',
  beforePhotos: [],
  moveInPhotos: kitchenMoveIn.slice(2, 3),
});

const stepperSteps: Record<'open' | 'done', Record<Phase, StepState>> = {
  open: { prepare: { state: 'complete' }, before_photos: { state: 'complete' }, move_in: { state: 'attention', label: '5 items still open' }, report: { state: 'upcoming' }, settle_in: { state: 'locked' }, summary: { state: 'locked' } },
  done: { prepare: { state: 'complete' }, before_photos: { state: 'complete' }, move_in: { state: 'complete' }, report: { state: 'upcoming' }, settle_in: { state: 'locked' }, summary: { state: 'locked' } },
};

const later = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

function TabsDemo() {
  const [tab, setTab] = useState('photos');
  return (
    <div className="flex h-128 flex-col overflow-hidden rounded-xl border">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
        <div className="border-b px-4 py-2">
          <TabsList className="h-auto w-full flex-wrap group-data-horizontal/tabs:h-auto sm:w-fit">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="checks">Room checks</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="problem">Add a problem</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="photos" className="min-h-0 overflow-y-auto p-4 text-base">
          <MoveInPhotoStrips room="kitchen" beforePhotos={kitchenBefore} moveInPhotos={kitchenMoveIn} attachedIds={new Set(kitchenMoveIn.slice(5, 6).map((item) => item.id))} onRelabel={() => undefined} onDelete={() => undefined} upload={later} />
        </TabsContent>
        <TabsContent value="checks" className="min-h-0 overflow-y-auto p-4 text-base">
          <RoomChecksTab checks={checks} onAnswer={later} onDelete={() => undefined} />
        </TabsContent>
        <TabsContent value="findings" className="min-h-0 overflow-y-auto p-4 text-base">
          <FindingsTab findings={aiFindings} hasBeforePhotos onResolve={later} />
        </TabsContent>
        <TabsContent value="problem" className="min-h-0 overflow-y-auto p-4 text-base">
          <AddProblemTab room="kitchen" problems={[ownProblem]} onAdd={later} onDelete={() => undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function MoveInDesignSections() {
  return (
    <>
      <DesignSection id="move-in-status" title="Open items status line" description="One line on the Move-in screen. Open means unanswered room checks plus findings waiting for an answer. Amber while anything is open, green when all is done.">
        <OpenItemsStatus openChecks={3} openFindings={2} />
        <OpenItemsStatus openChecks={1} openFindings={0} />
        <OpenItemsStatus openChecks={0} openFindings={1} />
        <OpenItemsStatus openChecks={0} openFindings={0} />
      </DesignSection>

      <DesignSection id="move-in-room-card" title="Move-in room card and Add a room" description="The Room card with move-in badges. The cover is the first move-in photo, else the first before photo. Badges: photo counts, problems, checks answered, and a notice when the room has no before photos. Default, no before photos, many photos with problems, comparing and failed with Try again. The dashed Add a room card lists rooms that have nothing yet.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li><MoveInRoomCard room="kitchen" beforePhotos={kitchenBefore.slice(0, 2)} moveInPhotos={kitchenMoveIn.slice(0, 2)} problemCount={0} checkedCount={1} checkTotal={4} onOpen={() => undefined} /></li>
          <li><MoveInRoomCard room="bathroom" beforePhotos={[]} moveInPhotos={bathroomMoveIn} problemCount={0} checkedCount={0} checkTotal={0} onOpen={() => undefined} /></li>
          <li><MoveInRoomCard room="living_room" beforePhotos={kitchenBefore} moveInPhotos={kitchenMoveIn} problemCount={2} checkedCount={5} checkTotal={5} onOpen={() => undefined} /></li>
          <li><MoveInRoomCard room="hallway" beforePhotos={hallwayBefore} moveInPhotos={hallwayMoveIn} problemCount={1} checkedCount={0} checkTotal={3} comparing onOpen={() => undefined} /></li>
          <li><MoveInRoomCard room="balcony" beforePhotos={hallwayBefore} moveInPhotos={hallwayMoveIn} problemCount={0} checkedCount={0} checkTotal={2} failed onRetry={() => undefined} onOpen={() => undefined} /></li>
          <li><AddRoomCard rooms={['bedroom', 'other']} onPick={() => undefined} /></li>
        </ul>
      </DesignSection>

      <DesignSection id="move-in-tabs" title="Move-in room tabs" description="The four tabs inside the open room card: Photos, Room checks, Findings, Add a problem. The strips mark each move-in photo as Compared, Not used in comparison (beyond the first 4) or Attached to a problem. Answer a check with Problem to see the note field.">
        <TabsDemo />
      </DesignSection>

      <DesignSection id="move-in-strips" title="Photos tab strips" description="Before is read-only. Without before photos the tab says the room is not compared and no Compared markers show. The upload row is fixed to this room.">
        <div className="grid gap-6 lg:grid-cols-2">
          <MoveInPhotoStrips room="kitchen" beforePhotos={kitchenBefore} moveInPhotos={kitchenMoveIn} attachedIds={new Set(kitchenMoveIn.slice(5, 6).map((item) => item.id))} onRelabel={() => undefined} onDelete={() => undefined} upload={later} />
          <MoveInPhotoStrips room="bathroom" beforePhotos={[]} moveInPhotos={bathroomMoveIn} attachedIds={new Set()} onRelabel={() => undefined} onDelete={() => undefined} upload={later} disabled />
        </div>
      </DesignSection>

      <DesignSection id="room-check-answer" title="Room check answer and problem note" description="Yes, Problem and N/A. Pressing the active option resets to unanswered. Problem opens a required note (1 to 500 characters) and up to 3 photos. The saved note and photos show under the check. Saving fails in the last row.">
        <ul className="divide-y rounded-xl border px-4">
          <RoomCheckAnswer check={checks[0] as RoomCheck} onAnswer={later} onDelete={() => undefined} />
          <RoomCheckAnswer check={problemCheck} onAnswer={later} onDelete={() => undefined} />
          <RoomCheckAnswer check={checks[1] as RoomCheck} onAnswer={later} onDelete={() => undefined} disabled />
          <RoomCheckAnswer check={checks[0] as RoomCheck} onAnswer={() => Promise.reject(new Error('Could not save your answer'))} onDelete={() => undefined} />
        </ul>
      </DesignSection>

      <DesignSection id="move-in-side-panel" title="Move-in stepper state and side panel counts" description="Move-in shows the amber attention state while any room check or finding is open. It never blocks navigation. From Move-in on, the side panel shows answered of total per room and a room opens its Move-in card.">
        <Stepper active="report" steps={stepperSteps.open} hrefFor={() => '#move-in-side-panel'} />
        <Stepper active="report" steps={stepperSteps.done} hrefFor={() => '#move-in-side-panel'} />
        <div className="max-w-sm">
          <RoomChecksSection checks={checks} phase="move_in" />
        </div>
      </DesignSection>
    </>
  );
}

