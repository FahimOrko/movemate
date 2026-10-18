import { reportTotals, type GuidanceProgress, type Photo, type Report, type ReportProblem as ReportProblemData, type ReportRoom, type ReportSummary, type Room } from '@movemate/contracts';
import { FileTextIcon } from 'lucide-react';
import { ReportProblem } from '@/components/report-problem';
import { ReportRoomSection } from '@/components/report-room-section';
import { ReportView } from '@/components/report-view';
import { SummaryChecklist } from '@/components/summary-checklist';
import { SummaryProblems } from '@/components/summary-problems';
import { SummaryRoomChecks } from '@/components/summary-room-checks';
import { SummaryStrip } from '@/components/summary-strip';
import { SummaryView } from '@/components/summary-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DesignSection } from './design-section';

const moveId = '00000000-0000-4000-8000-000000000099';
const noop = () => undefined;

const photo = (index: number, stage: Photo['stage'], room: Room): Photo => ({
  id: `00000000-0000-4000-8000-0000000007${String(index).padStart(2, '0')}`,
  moveId,
  stage,
  room,
  width: 800,
  height: 600,
  createdAt: stage === 'before' ? '2026-09-28T16:05:00.000Z' : '2026-10-12T14:32:00.000Z',
  url: `https://picsum.photos/seed/movemate-report-${stage}-${room}-${index}/400/300`,
});
const photos = (from: number, count: number, stage: Photo['stage'], room: Room) => Array.from({ length: count }, (_, index) => photo(from + index, stage, room));

const problemId = (index: number) => `00000000-0000-4000-8000-0000000008${String(index).padStart(2, '0')}`;
const checkId = (index: number) => `00000000-0000-4000-8000-0000000009${String(index).padStart(2, '0')}`;

const roomCheckProblem: ReportProblemData = {
  findingId: problemId(1),
  source: 'room_check',
  checkText: 'Look at the oven door seal along the lower edge for gaps or tears.',
  aiSummary: null,
  resolution: 'issue',
  note: 'The seal is torn on the left side.',
  beforePhotos: [],
  moveInPhotos: photos(10, 2, 'move_in', 'kitchen'),
};
const aiIssueProblem: ReportProblemData = {
  findingId: problemId(2),
  source: 'ai',
  checkText: null,
  aiSummary: 'A dark mark may be visible on the ceiling above the window in the move-in photos.',
  resolution: 'issue',
  note: 'Visible in person, near the light switch.',
  beforePhotos: photos(1, 1, 'before', 'kitchen'),
  moveInPhotos: photos(12, 1, 'move_in', 'kitchen'),
};
const aiCustomProblem: ReportProblemData = {
  findingId: problemId(3),
  source: 'ai',
  checkText: null,
  aiSummary: 'The countertop edge looks similar in both sets of photos.',
  resolution: 'custom',
  note: 'There is a chip on the underside that the photos do not show.',
  beforePhotos: photos(1, 1, 'before', 'kitchen'),
  moveInPhotos: [],
};
const userProblem: ReportProblemData = {
  findingId: problemId(4),
  source: 'user',
  checkText: null,
  aiSummary: null,
  resolution: 'issue',
  note: 'The window handle is loose and the frame has a gap on the left.',
  beforePhotos: [],
  moveInPhotos: photos(20, 5, 'move_in', 'kitchen'),
};

const kitchen: ReportRoom = {
  room: 'kitchen',
  beforePhotos: photos(1, 3, 'before', 'kitchen'),
  moveInPhotos: photos(30, 4, 'move_in', 'kitchen'),
  checks: [
    { checkId: checkId(1), text: 'Look at the countertop edge left of the sink for chips or stains.', source: 'ai', status: 'ok' },
    { checkId: checkId(2), text: 'Look at the oven door seal along the lower edge for gaps or tears.', source: 'ai', status: 'problem' },
    { checkId: checkId(3), text: 'Look at the tiles behind the stove for cracks.', source: 'ai', status: 'ok' },
    { checkId: checkId(4), text: 'Ask about the dishwasher filter.', source: 'user', status: 'pending' },
    { checkId: checkId(5), text: 'Look at the balcony door seal.', source: 'ai', status: 'na' },
    { checkId: checkId(6), text: 'Look at the cabinet doors under the sink.', source: 'ai', status: 'ok' },
    { checkId: checkId(7), text: 'Look at the fridge shelves for cracks.', source: 'ai', status: 'pending' },
  ],
  problems: [roomCheckProblem, aiIssueProblem, aiCustomProblem, userProblem],
};
const bathroomNoBefore: ReportRoom = {
  room: 'bathroom',
  beforePhotos: [],
  moveInPhotos: photos(40, 2, 'move_in', 'bathroom'),
  checks: [{ checkId: checkId(10), text: 'Look at the grout around the shower.', source: 'user', status: 'ok' }],
  problems: [],
};
const hallway: ReportRoom = {
  room: 'hallway',
  beforePhotos: photos(50, 1, 'before', 'hallway'),
  moveInPhotos: photos(51, 1, 'move_in', 'hallway'),
  checks: [
    { checkId: checkId(20), text: 'Look at the wall left of the door for marks.', source: 'ai', status: 'ok' },
    { checkId: checkId(21), text: 'Look at the shoe rack area for scuffs.', source: 'ai', status: 'ok' },
  ],
  problems: [],
};

const watchList = [
  { title: 'Unclear in the photos', detail: 'The wall left of the door may have a mark.', dueDate: '2026-11-11' },
  { title: 'Heating', detail: 'Check that every radiator warms up and the thermostat responds.', dueDate: '2026-11-11' },
];
const baseReport: Report = {
  id: '00000000-0000-4000-8000-000000000400',
  moveId,
  createdAt: '2026-10-12T15:00:00.000Z',
  snapshot: {
    version: 2,
    move: { address: 'Aurakatu 12, Turku', moveDate: '2026-10-12' },
    generatedAt: '2026-10-12T15:00:00.000Z',
    rooms: [kitchen, bathroomNoBefore, hallway],
    watchList,
    disclaimer: 'This report documents what the tenant recorded and confirmed. It is not a legal or insurance determination.',
  },
};
const zeroProblemReport: Report = {
  ...baseReport,
  snapshot: { ...baseReport.snapshot, rooms: [{ ...bathroomNoBefore }, hallway], watchList: watchList.slice(1) },
};

export function ReportDesignSections() {
  const totals = reportTotals(baseReport.snapshot);
  return (
    <>
      <DesignSection id="report-strip" title="Summary strip" description="Four stats under the report header, and five on the Summary. A calm surface on screen; print drops the border and keeps the grid.">
        <SummaryStrip
          label="Report totals"
          stats={[
            { label: 'Rooms', value: totals.roomsDocumented },
            { label: 'Photos', value: totals.beforePhotos + totals.moveInPhotos },
            { label: 'Problems', value: totals.problems },
            { label: 'Checks answered', value: `${totals.checksAnswered} of ${totals.checksTotal}` },
          ]}
        />
        <SummaryStrip
          label="Report totals, empty"
          stats={[
            { label: 'Rooms', value: 0 },
            { label: 'Photos', value: 0 },
            { label: 'Problems', value: 0 },
            { label: 'Checks answered', value: '0 of 0' },
          ]}
        />
      </DesignSection>

      <DesignSection
        id="report-problems"
        title="Report problems by source"
        description="Each problem names its source: Room check, AI finding or Added by you. An AI finding the renter answered in their own words also says Your own answer. Photos can be enlarged. Print shows at most 3 photos per stage and a +N more photos line; the last problem has 5 photos."
      >
        <Card>
          <CardContent>
            <ul className="divide-y">
              {[roomCheckProblem, aiIssueProblem, aiCustomProblem, userProblem].map((problem) => (
                <ReportProblem key={problem.findingId} problem={problem} roomLabel="kitchen" />
              ))}
            </ul>
          </CardContent>
        </Card>
      </DesignSection>

      <DesignSection
        id="report-room"
        title="Report room section"
        description="One per room: photo counts, before photos then move-in photos with upload times, the check status line, problems, and the room checks in a collapsed group (printed as a compact list). Shown with everything, with no before photos, and with no problems."
      >
        <Card>
          <CardContent className="flex flex-col gap-8">
            <ReportRoomSection room={kitchen} />
            <ReportRoomSection room={bathroomNoBefore} />
            <ReportRoomSection room={hallway} />
          </CardContent>
        </Card>
      </DesignSection>

      <DesignSection id="report-full" title="Full report" description="The report as it prints, with problems and with none. Saved reports from an older version show the last state and ask for a regenerate.">
        <Card>
          <CardContent>
            <ReportView report={baseReport} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ReportView report={zeroProblemReport} />
          </CardContent>
        </Card>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>This report is from an older version</EmptyTitle>
            <EmptyDescription>Regenerate this report to see it with the full record of your move.</EmptyDescription>
          </EmptyHeader>
          <Button>Regenerate this report</Button>
        </Empty>
      </DesignSection>
    </>
  );
}

const summaryBase: ReportSummary = {
  reportId: baseReport.id,
  address: 'Aurakatu 12, Turku',
  moveDate: '2026-10-12',
  generatedAt: '2026-10-12T15:00:00.000Z',
  totals: reportTotals(baseReport.snapshot),
  problems: [
    { room: 'kitchen', source: 'room_check', text: 'The seal is torn on the left side.', photoCount: 2 },
    { room: 'kitchen', source: 'ai', text: 'Visible in person, near the light switch.', photoCount: 2 },
    { room: 'kitchen', source: 'user', text: 'The window handle is loose and the frame has a gap on the left.', photoCount: 5 },
    { room: 'balcony', source: 'user', text: 'Rust on the railing.', photoCount: 0 },
  ],
  rooms: [
    { room: 'kitchen', counts: { total: 7, checked: 5, problems: 1, na: 1 }, notChecked: ['Ask about the dishwasher filter.', 'Look at the fridge shelves for cracks.'] },
    { room: 'hallway', counts: { total: 2, checked: 2, problems: 0, na: 0 }, notChecked: [] },
  ],
  watchListDueDate: '2026-11-11',
  checklist: { open: [], handled: [] },
};

export function SummaryDesignSections({ checklist }: { checklist: GuidanceProgress[] }) {
  const open = checklist.filter((entry) => entry.status === 'pending' || entry.status === 'no');
  const handled = checklist.filter((entry) => entry.status === 'done' || entry.status === 'na');
  const withProvider = checklist.map((entry): GuidanceProgress => ({ ...entry, providerName: null }));
  const insurance: GuidanceProgress = {
    key: 'get-home-insurance',
    category: 'Settle in',
    title: 'Get home insurance',
    status: 'done',
    locked: false,
    providerName: 'If',
    linkedCategory: 'home_insurance',
  };
  const summary: ReportSummary = { ...summaryBase, checklist: { open, handled: [insurance, ...handled] } };
  const discountCodes = { home_insurance: 'MOVEMATE10' };
  return (
    <>
      <DesignSection id="summary-problems" title="Summary problems and room checks" description="Problems found, grouped by room with source, note and photo count; each room links to its place in the report. Room checks show a status line per room and list what was Not checked as a reminder. Empty states below.">
        <SummaryProblems problems={summaryBase.problems} reportHref="/design#report-room" />
        <SummaryRoomChecks rooms={summaryBase.rooms} />
        <SummaryProblems problems={[]} reportHref="/design#report-room" />
        <SummaryRoomChecks rooms={[]} />
      </DesignSection>

      <DesignSection id="summary-checklist" title="Summary move checklist" description="Still-open items first with the Yes / No / N/A control, handled items in a collapsed group. A linked item shows the chosen provider and the If discount code. Print lists every item with its status and no controls.">
        <SummaryChecklist checklist={summary.checklist} onStatusChange={noop} discountCodes={discountCodes} />
        <SummaryChecklist checklist={{ open: [], handled: withProvider.filter((entry) => entry.status === 'done') }} onStatusChange={noop} discountCodes={{}} />
      </DesignSection>

      <DesignSection id="summary" title="Summary" description="The record of the whole move: move info, totals, problems, room checks, checklist, watch list and the closing line. Print hides the stepper, links and buttons and shows every status. Shown with problems and open items, then with nothing to report.">
        <div className="flex flex-col gap-10">
          <SummaryView summary={summary} discountCodes={discountCodes} reportHref="/design#report-full" onChecklistStatusChange={noop} />
          <SummaryView
            summary={{
              ...summaryBase,
              moveDate: null,
              watchListDueDate: null,
              totals: { roomsDocumented: 0, beforePhotos: 0, moveInPhotos: 1, checksAnswered: 0, checksTotal: 0, problems: 0 },
              problems: [],
              rooms: [],
              checklist: { open: [], handled },
            }}
            discountCodes={{}}
            reportHref="/design#report-full"
            onChecklistStatusChange={noop}
          />
        </div>
      </DesignSection>
    </>
  );
}
