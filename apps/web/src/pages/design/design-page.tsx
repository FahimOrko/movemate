import { MAX_PHOTOS_PER_ROOM, type ChecklistStatus, type Finding, type GuidanceProgress, type Photo, type Report, type Room, type RoomCheck } from '@movemate/contracts';
import { CircleAlertIcon, FileTextIcon, HouseIcon, InfoIcon, PrinterIcon, RefreshCwIcon, ScanSearchIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { AddFindingForm } from '@/components/add-finding-form';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { HeaderNav } from '@/components/header-nav';
import { FindingRow } from '@/components/finding-row';
import { InteractiveBackground } from '@/components/interactive-background';
import { Logo } from '@/components/logo';
import { ChecklistDrawer } from '@/components/checklist-drawer';
import { ChecklistPanel } from '@/components/checklist-panel';
import { ChecklistRow } from '@/components/checklist-row';
import { StatusControl } from '@/components/status-control';
import { CreateMoveFields } from '@/components/create-move-fields';
import { PhotoGrid } from '@/components/photo-grid';
import { PhotoUploader } from '@/components/photo-uploader';
import { ReportIssue } from '@/components/report-issue';
import { ReportView } from '@/components/report-view';
import { RoomCard } from '@/components/room-card';
import { RoomCheckList } from '@/components/room-check-list';
import { RoomChecksSection } from '@/components/room-checks-section';
import { RoomSelect } from '@/components/room-select';
import { StartOverDialog } from '@/components/start-over-dialog';
import { Stepper, type StepState } from '@/components/stepper';
import { DiscountBadge } from '@/components/discount-badge';
import { InsuranceExplainer } from '@/components/insurance-explainer';
import { ProviderCategoryList } from '@/components/provider-category-list';
import { PARTNER_TAG } from '@/features/settle-in/partner-tag';
import { SettleInProgress } from '@/components/settle-in-progress';
import { SummaryView } from '@/components/summary-view';
import { TipCard } from '@/components/tip-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { DesignSection } from './design-section';
import { MoveInDesignSections } from './move-in-design-sections';
import { RoomDialogDemo } from './room-dialog-demo';

// Class names are written out in full so Tailwind can find them.
// Class names are written out in full so Tailwind can find them. Hex values are documentation of the tokens in index.css.
type Swatch = { token: string; hex: string; swatch: string };

const colorTokens: Swatch[] = [
  { token: 'background', hex: '#FFFFFF', swatch: 'bg-background' },
  { token: 'surface', hex: '#F5F5F7', swatch: 'bg-surface' },
  { token: 'foreground', hex: '#1D1D1F', swatch: 'bg-foreground' },
  { token: 'muted-foreground', hex: '#6E6E73', swatch: 'bg-muted-foreground' },
  { token: 'border / grid', hex: '#D2D2D7', swatch: 'bg-border' },
  { token: 'input', hex: '#86868B', swatch: 'bg-input' },
  { token: 'primary', hex: '#0071E3', swatch: 'bg-primary' },
  { token: 'primary-hover', hex: '#0077ED', swatch: 'bg-primary-hover' },
  { token: 'primary-pressed', hex: '#006EDB', swatch: 'bg-primary-pressed' },
  { token: 'ring', hex: '#0071E3 at 40%', swatch: 'bg-ring/40' },
];

const statusTokens: Swatch[] = [
  { token: 'success', hex: '#34C759', swatch: 'bg-success' },
  { token: 'success-text', hex: '#1F7A38', swatch: 'bg-success-text' },
  { token: 'warning', hex: '#FF9500', swatch: 'bg-warning' },
  { token: 'warning-text', hex: '#A64B00', swatch: 'bg-warning-text' },
  { token: 'destructive', hex: '#FF3B30', swatch: 'bg-destructive' },
  { token: 'destructive-text', hex: '#C9000F', swatch: 'bg-destructive-text' },
];

function SwatchList({ swatches }: { swatches: Swatch[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {swatches.map(({ token, hex, swatch }) => (
        <li key={token} className="flex items-center gap-3">
          <span className={`size-10 shrink-0 rounded-lg border ${swatch}`} />
          <span className="flex flex-col text-sm">
            {token}
            <code className="text-xs text-muted-foreground">{hex}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}

const typeScale = [
  { token: 'text-display', className: 'text-display', sample: 'Move in with proof.' },
  { token: 'text-title', className: 'text-title', sample: 'Before photos' },
  { token: 'text-heading', className: 'text-heading', sample: 'Kitchen' },
  { token: 'text-base', className: 'text-base', sample: 'A mark may be visible on the counter near the sink.' },
  { token: 'text-sm', className: 'text-sm', sample: 'Uploaded 12 Oct 2026, 14:32' },
  { token: 'text-xs', className: 'text-xs', sample: 'JPEG, PNG or WebP' },
];

const spacingScale = [
  { step: '1', bar: 'w-1' },
  { step: '2', bar: 'w-2' },
  { step: '3', bar: 'w-3' },
  { step: '4', bar: 'w-4' },
  { step: '6', bar: 'w-6' },
  { step: '8', bar: 'w-8' },
  { step: '12', bar: 'w-12' },
  { step: '16', bar: 'w-16' },
  { step: '24', bar: 'w-24' },
];

const radiusScale = [
  { token: 'rounded-sm', className: 'rounded-sm' },
  { token: 'rounded-md', className: 'rounded-md' },
  { token: 'rounded-lg', className: 'rounded-lg' },
  { token: 'rounded-xl', className: 'rounded-xl' },
  { token: 'rounded-4xl', className: 'rounded-4xl' },
];

const samplePhotos: Photo[] = [
  { room: 'kitchen', file: 'kitchen' },
  { room: 'kitchen', file: 'kitchen-2' },
  { room: 'bedroom', file: 'bedroom' },
].map(({ room, file }, index) => ({
  id: `00000000-0000-4000-8000-00000000000${index}`,
  moveId: '00000000-0000-4000-8000-000000000099',
  stage: 'before',
  room: room as Room,
  width: 800,
  height: 600,
  createdAt: '2026-10-12T14:32:00.000Z',
  url: `https://picsum.photos/seed/movemate-${file}/400/300`,
}));

const designDialogPhotos: Photo[] = [
  ...samplePhotos,
  { ...(samplePhotos[0] as Photo), id: '00000000-0000-4000-8000-000000000003', room: 'hallway', url: 'https://picsum.photos/seed/movemate-hallway/400/300' },
];

const sampleChecks: RoomCheck[] = (
  [
    { source: 'ai', text: 'Check whether the countertop edge left of the sink has chips or stains.' },
    { source: 'ai', text: 'Check whether the oven door seal appears intact along the lower edge.' },
    { source: 'user', text: 'Ask about the dishwasher filter.' },
  ] as const
).map((check, index) => ({
  ...check,
  id: `00000000-0000-4000-8000-0000000001${index}0`,
  moveId: '00000000-0000-4000-8000-000000000099',
  room: 'kitchen',
  status: 'pending',
  problem: null,
  createdAt: '2026-10-12T14:32:00.000Z',
}));

const sampleMoveInPhotos: Photo[] = samplePhotos.slice(0, 2).map((photo, index) => ({
  ...photo,
  id: `00000000-0000-4000-8000-00000000002${index}`,
  stage: 'move_in',
  url: `https://picsum.photos/seed/movemate-move-in-${index}/400/300`,
}));

const baseFinding: Finding = {
  id: '00000000-0000-4000-8000-000000000300',
  moveId: '00000000-0000-4000-8000-000000000099',
  room: 'kitchen',
  roomCheckId: null,
  checkText: null,
  source: 'ai',
  aiStatus: 'changed',
  aiSummary: 'A dark mark may be visible on the ceiling above the window in the move-in photos.',
  confidence: 'high',
  resolution: 'pending',
  userNote: null,
  beforePhotos: samplePhotos.slice(0, 1),
  moveInPhotos: sampleMoveInPhotos.slice(0, 1),
  createdAt: '2026-10-12T14:32:00.000Z',
  updatedAt: '2026-10-12T14:32:00.000Z',
};

const sampleFindings: { title: string; finding: Finding; disabled?: boolean }[] = [
  { title: 'Changed, pending', finding: baseFinding },
  {
    title: 'Unclear, marked as an issue with a note',
    finding: {
      ...baseFinding,
      id: '00000000-0000-4000-8000-000000000301',
      aiStatus: 'unclear',
      confidence: 'low',
      aiSummary: 'The wall left of the door may have a mark, but the angle makes it hard to compare.',
      resolution: 'issue',
      userNote: 'Visible in person, near the light switch.',
      moveInPhotos: sampleMoveInPhotos,
    },
  },
  {
    title: 'Looks the same, with a related check, marked OK',
    finding: {
      ...baseFinding,
      id: '00000000-0000-4000-8000-000000000302',
      aiStatus: 'looks_good',
      confidence: 'medium',
      aiSummary: 'The countertop edge left of the sink looks similar in both sets of photos.',
      roomCheckId: '00000000-0000-4000-8000-000000000100',
      checkText: 'Check whether the countertop edge left of the sink has chips or stains.',
      resolution: 'ok',
    },
  },
  {
    title: 'Custom answer',
    finding: {
      ...baseFinding,
      id: '00000000-0000-4000-8000-000000000303',
      aiStatus: 'unclear',
      confidence: 'medium',
      resolution: 'custom',
      userNote: 'The mark was already there at the viewing.',
    },
  },
  {
    title: 'Added by you',
    finding: {
      ...baseFinding,
      id: '00000000-0000-4000-8000-000000000304',
      source: 'user',
      aiStatus: null,
      aiSummary: null,
      confidence: null,
      resolution: 'issue',
      userNote: 'Scratch on the door frame near the hinge.',
      beforePhotos: [],
      moveInPhotos: [],
    },
  },
  { title: 'Disabled while saving', finding: baseFinding, disabled: true },
];

const buttonVariants = ['default', 'secondary', 'ghost', 'destructive', 'link'] as const;
const buttonSizes = ['sm', 'default', 'lg', 'xl'] as const;
const badgeVariants = ['default', 'secondary', 'outline'] as const;
const statusBadgeVariants = ['success', 'warning', 'destructive'] as const;

const sampleReport: Report = {
  id: '00000000-0000-4000-8000-000000000400',
  moveId: '00000000-0000-4000-8000-000000000099',
  createdAt: '2026-10-12T15:00:00.000Z',
  snapshot: {
    move: { address: 'Aurakatu 12, Turku', moveDate: '2026-10-12' },
    generatedAt: '2026-10-12T15:00:00.000Z',
    issues: [
      {
        findingId: '00000000-0000-4000-8000-000000000301',
        room: 'kitchen',
        kind: 'issue',
        text: 'A dark mark may be visible on the ceiling above the window in the move-in photos.',
        note: 'Visible in person, near the light switch.',
        beforePhotos: samplePhotos.slice(0, 1),
        moveInPhotos: sampleMoveInPhotos,
      },
      {
        findingId: '00000000-0000-4000-8000-000000000303',
        room: 'bedroom',
        kind: 'custom',
        text: 'The window handle is loose.',
        note: null,
        beforePhotos: [],
        moveInPhotos: [],
      },
    ],
    findingsByRoom: [
      {
        room: 'kitchen',
        findings: [
          { findingId: '00000000-0000-4000-8000-000000000301', aiStatus: 'changed', resolution: 'issue', text: 'A dark mark may be visible on the ceiling.', note: null },
          { findingId: '00000000-0000-4000-8000-000000000302', aiStatus: 'looks_good', resolution: 'ok', text: 'The countertop edge looks similar in both sets of photos.', note: null },
        ],
      },
    ],
    watchList: [
      { title: 'Unclear in the photos', detail: 'The wall left of the door may have a mark.', dueDate: '2026-11-11' },
      { title: 'Heating', detail: 'Check that every radiator warms up and the thermostat responds.', dueDate: '2026-11-11' },
    ],
    disclaimer: 'This report documents what the tenant recorded and confirmed. It is not a legal or insurance determination.',
  },
};

const zeroIssueReport: Report = {
  ...sampleReport,
  snapshot: { ...sampleReport.snapshot, issues: [], findingsByRoom: [], watchList: sampleReport.snapshot.watchList.slice(1) },
};

const designDiscount = { percent: 10, durationMonths: 12, code: 'MOVEMATE10' };
const electricityOptions = [
  { key: 'a', name: 'Electricity Provider A' },
  { key: 'b', name: 'Electricity Provider B' },
];
const ifOption = { key: 'insurance-if', name: 'If', url: 'https://example.com/if-insurance', discount: designDiscount, tag: PARTNER_TAG };
const designChecklist: GuidanceProgress[] = [
  { key: 'sign-lease', category: 'Before you move', title: 'Read and sign the lease', description: 'Check the deposit and notice period.', status: 'pending', locked: false, providerName: null },
  { key: 'deposit', category: 'Before you move', title: 'Pay the deposit and keep the receipt', status: 'done', locked: false, providerName: null },
  { key: 'keys', category: 'Before you move', title: 'Collect the keys', status: 'no', locked: false, providerName: null },
  { key: 'parking', category: 'After you arrive', title: 'Ask about a parking permit', status: 'na', locked: false, providerName: null },
];
const allHandled = designChecklist.map((entry): GuidanceProgress => ({ ...entry, status: entry.status === 'pending' || entry.status === 'no' ? 'done' : entry.status }));
const noop = () => undefined;

function CollapsiblePanelDemo({ initialChecklistCollapsed, initialRoomChecksCollapsed }: { initialChecklistCollapsed: boolean; initialRoomChecksCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(initialChecklistCollapsed);
  const [roomChecksCollapsed, setRoomChecksCollapsed] = useState(initialRoomChecksCollapsed);
  return (
    <ChecklistPanel
      entries={designChecklist}
      onStatusChange={noop}
      roomChecks={sampleChecks}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      roomChecksCollapsed={roomChecksCollapsed}
      onRoomChecksCollapsedChange={setRoomChecksCollapsed}
    />
  );
}

function StatusControlDemo({ label, initial, disabled }: { label: string; initial: ChecklistStatus; disabled?: boolean }) {
  const [status, setStatus] = useState(initial);
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <StatusControl value={status} onChange={setStatus} label={label} disabled={disabled} />
    </div>
  );
}

const stepperExamples: { caption: string; active: 'prepare' | 'before_photos' | 'move_in'; steps: Record<'prepare' | 'before_photos' | 'move_in' | 'report' | 'settle_in' | 'summary', StepState> }[] = [
  {
    caption: 'Current: Prepare is open, later phases are locked.',
    active: 'prepare',
    steps: { prepare: { state: 'upcoming' }, before_photos: { state: 'locked' }, move_in: { state: 'locked' }, report: { state: 'locked' }, settle_in: { state: 'locked' }, summary: { state: 'locked' } },
  },
  {
    caption: 'Complete: every move checklist item handled.',
    active: 'before_photos',
    steps: { prepare: { state: 'complete' }, before_photos: { state: 'upcoming' }, move_in: { state: 'locked' }, report: { state: 'locked' }, settle_in: { state: 'locked' }, summary: { state: 'locked' } },
  },
  {
    caption: 'Attention: hover or focus Prepare for "3 items still open". It is still a link.',
    active: 'move_in',
    steps: { prepare: { state: 'attention', label: '3 items still open' }, before_photos: { state: 'complete' }, move_in: { state: 'upcoming' }, report: { state: 'locked' }, settle_in: { state: 'locked' }, summary: { state: 'locked' } },
  },
];

const designSummary = {
  reportId: '00000000-0000-4000-8000-000000000000',
  address: 'Aurakatu 12, Turku',
  moveDate: '2026-11-01',
  generatedAt: '2026-11-01T10:00:00.000Z',
  roomsDocumented: 4,
  counts: { ok: 9, issues: 2, custom: 1 },
  watchListDueDate: '2026-12-01',
  checklist: { open: designChecklist.filter((entry) => entry.status === 'pending' || entry.status === 'no'), handled: designChecklist.filter((entry) => entry.status === 'done' || entry.status === 'na') },
};

export function DesignPage() {
  const [startOverState, setStartOverState] = useState<'default' | 'loading' | 'error' | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-12">
        <div>
          <h1 className="text-title">Design system</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Every token and component MoveMate uses, in each of its states.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/">Back to MoveMate</Link>
        </Button>
      </header>

      <DesignSection id="logo" title="Logo" description="A house with a check mark. Mark in primary, wordmark in foreground. Size is a prop in px.">
        <div className="flex flex-wrap items-end gap-8">
          {[16, 24, 32, 48, 64].map((size) => (
            <div key={size} className="flex flex-col items-start gap-2">
              <Logo variant="mark" size={size} />
              <span className="text-sm text-muted-foreground">Mark {size}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-8">
          {[16, 24, 32, 48, 64].map((size) => (
            <div key={size} className="flex flex-col items-start gap-2">
              <Logo size={size} />
              <span className="text-sm text-muted-foreground">Wordmark {size}</span>
            </div>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="colors"title="Colors" description="Apple's palette. Light theme only.">
        <SwatchList swatches={colorTokens} />
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Status colors. Findings and errors only, never decoration. Use the fill for borders and icons and the text
            variant for words, because the fills fail 4.5:1 on white.
          </p>
          <SwatchList swatches={statusTokens} />
        </div>
      </DesignSection>

      <DesignSection id="type" title="Typography" description="System font stack, so Apple devices render SF. Three custom steps on top of Tailwind's base, sm and xs.">
        <ul className="flex flex-col gap-5">
          {typeScale.map((step) => (
            <li key={step.token} className="grid gap-1 sm:grid-cols-4 sm:items-baseline sm:gap-6">
              <code className="text-xs text-muted-foreground">{step.token}</code>
              <span className={`min-w-0 sm:col-span-3 ${step.className}`}>{step.sample}</span>
            </li>
          ))}
        </ul>
      </DesignSection>

      <DesignSection id="spacing" title="Spacing and radius" description="Tailwind's 4px spacing steps. Inputs use rounded-lg (10px), cards rounded-xl (16px), buttons and badges are pills.">
        <ul className="flex flex-col gap-2">
          {spacingScale.map((space) => (
            <li key={space.step} className="flex items-center gap-4">
              <code className="w-8 text-xs text-muted-foreground">{space.step}</code>
              <span className={`h-3 rounded-sm bg-primary ${space.bar}`} />
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-4">
          {radiusScale.map((radius) => (
            <li key={radius.token} className="flex flex-col items-center gap-2">
              <span className={`size-14 border-2 border-primary bg-accent ${radius.className}`} />
              <code className="text-xs text-muted-foreground">{radius.token}</code>
            </li>
          ))}
        </ul>
      </DesignSection>

      <DesignSection id="buttons" title="Button" description="Pills. Hover and press show primary-hover and primary-pressed. Press Tab to see the blue focus ring.">
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {buttonSizes.map((size) => (
            <Button key={size} size={size}>
              Size {size}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button disabled aria-busy="true">
            <Spinner data-icon="inline-start" />
            Saving
          </Button>
          <Button variant="secondary" disabled>
            Disabled secondary
          </Button>
        </div>
      </DesignSection>

      <DesignSection id="inputs" title="Input and label" description="Label above, error text below.">
        <div className="grid max-w-md gap-6">
          <div className="grid gap-2">
            <Label htmlFor="design-address">Address</Label>
            <Input id="design-address" placeholder="Aurakatu 12 B 7, Turku" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="design-disabled">Disabled</Label>
            <Input id="design-disabled" disabled value="Aurakatu 12 B 7, Turku" readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="design-error">With error</Label>
            <Input id="design-error" aria-invalid="true" aria-describedby="design-error-text" defaultValue="" />
            <p id="design-error-text" className="text-sm text-destructive-text">
              Enter the address you are moving into.
            </p>
          </div>
        </div>
      </DesignSection>

      <DesignSection id="cards" title="Card" description="White with a soft shadow, or the surface color with none.">
        <div className="grid gap-6 sm:grid-cols-2">
          {(['default', 'surface'] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader>
                <CardTitle>Kitchen</CardTitle>
                <CardDescription>4 before photos</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">Check whether the counter edge near the sink is chipped.</CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Add a check
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="badges" title="Badge" description="Status badges are for findings and errors only.">
        <div className="flex flex-wrap items-center gap-3">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {statusBadgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="table" title="Table and separator" description="Label and value rows with a divider between rows, and a separator between two blocks.">
        <Card>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">Rent</TableCell>
                  <TableCell>890 € / month</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">Size</TableCell>
                  <TableCell>42 m²</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">Content below a separator.</p>
          </CardContent>
        </Card>
      </DesignSection>

      <DesignSection id="checkbox" title="Checkbox" description="Default, checked, disabled and error. Press Tab for the focus ring.">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { id: 'cb-default', label: 'Default' },
            { id: 'cb-checked', label: 'Checked', defaultChecked: true },
            { id: 'cb-disabled', label: 'Disabled', disabled: true },
            { id: 'cb-disabled-checked', label: 'Disabled checked', disabled: true, defaultChecked: true },
            { id: 'cb-error', label: 'Error', 'aria-invalid': true },
          ].map(({ id, label, ...props }) => (
            <div key={id} className="flex items-center gap-2">
              <Checkbox id={id} {...props} />
              <Label htmlFor={id}>{label}</Label>
            </div>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="stepper" title="Stepper" description="Current, complete (green check), attention (amber warning, never blocks) and locked. Labels collapse to the active one below the lg breakpoint.">
        <div className="flex flex-col gap-8">
          {stepperExamples.map(({ caption, active, steps }) => (
            <div key={caption} className="flex flex-col gap-3">
              <Stepper active={active} steps={steps} hrefFor={() => '/design#stepper'} />
              <p className="text-sm text-muted-foreground">{caption}</p>
            </div>
          ))}
        </div>
      </DesignSection>

      <DesignSection id="status-control" title="Status control" description="Yes, No and N/A. Pressing the active option resets to not answered. Pending, each answer and disabled. Press Tab for the focus ring.">
        <div className="flex max-w-md flex-col gap-4">
          <StatusControlDemo label="Not answered" initial="pending" />
          <StatusControlDemo label="Yes" initial="done" />
          <StatusControlDemo label="No" initial="no" />
          <StatusControlDemo label="N/A" initial="na" />
          <StatusControlDemo label="Disabled" initial="done" disabled />
        </div>
      </DesignSection>

      <DesignSection id="checklist" title="Move checklist row and tip card" description="One line per item. Yes shows a check and strikethrough, No an amber marker, N/A greys out. The info icon expands the description inline.">
        <div className="max-w-xl divide-y">
          <ChecklistRow title="Read and sign the lease" description="Check the deposit and notice period." status="pending" onStatusChange={noop} />
          <ChecklistRow title="Pay the deposit and keep the receipt" status="done" onStatusChange={noop} />
          <ChecklistRow title="Collect the keys" status="no" onStatusChange={noop} />
          <ChecklistRow title="Ask about a parking permit" status="na" onStatusChange={noop} />
          <ChecklistRow title="Book the moving van" description="Compare two or three quotes and book early." status="pending" defaultExpanded onStatusChange={noop} />
          <ChecklistRow title="Disabled while saving" status="pending" disabled onStatusChange={noop} />
          <ChecklistRow title="Get home insurance (locked)" status="pending" linked locked onStatusChange={noop} />
          <ChecklistRow title="Order an internet connection (unlocked)" status="pending" linked onStatusChange={noop} />
          <ChecklistRow title="Arrange electricity (provider chosen)" status="done" linked providerName="Electricity Provider A" onStatusChange={noop} />
          <ChecklistRow title="Arrange electricity (included in rent)" status="na" linked onStatusChange={noop} />
        </div>
        <div className="max-w-md">
          <TipCard title="Label boxes by room" body="Write the destination room on every box so movers can place them straight away." />
        </div>
      </DesignSection>

      <DesignSection id="checklist-panel" title="Move checklist panel and drawer" description="The side panel on lg and up, with the handled counter. It collapses to a compact bar with a progress line and done, N/A and left counts; Room checks has its own toggle and collapses independently, so the two sections can be in any combination (the app defaults to checklist open, Room checks closed). Both choices are remembered separately. The drawer trigger also shows what is left. Below lg the same panel opens from the trigger in a Sheet.">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="max-w-sm">
            <ChecklistPanel entries={designChecklist} onStatusChange={noop} roomChecks={sampleChecks} />
          </div>
          <div className="max-w-sm">
            <ChecklistPanel entries={allHandled} onStatusChange={noop} />
          </div>
          <div className="max-w-sm">
            <CollapsiblePanelDemo initialChecklistCollapsed={false} initialRoomChecksCollapsed />
          </div>
          <div className="max-w-sm">
            <CollapsiblePanelDemo initialChecklistCollapsed initialRoomChecksCollapsed={false} />
          </div>
        </div>
        <div>
          <ChecklistDrawer entries={designChecklist} onStatusChange={noop} />
        </div>
      </DesignSection>

      <DesignSection id="provider-category-list" title="Provider category list" description="One flat radiogroup per category in a single bordered container. The whole row is the click target, a second click clears the choice and arrow keys move and select. The last row is always Not needed (N/A). Shown default, selected and N/A selected.">
        <div className="flex max-w-xl flex-col gap-10">
          <ProviderCategoryList label="Electricity default" options={electricityOptions} selectedKey={null} notNeeded={false} onChoose={noop} onToggleNotNeeded={noop} />
          <ProviderCategoryList label="Electricity selected" options={electricityOptions} selectedKey="b" notNeeded={false} onChoose={noop} onToggleNotNeeded={noop} />
          <ProviderCategoryList label="Electricity N/A selected" options={electricityOptions} selectedKey={null} notNeeded onChoose={noop} onToggleNotNeeded={noop} />
        </div>
      </DesignSection>

      <DesignSection id="provider-if-row" title="If row" description="The highlighted insurer with a quiet partner tag. A small discount badge opens a popover on hover, focus or tap (closed, open, copied), and a quiet quote link opens in a new tab. Without a configured url the link is hidden.">
        <div className="flex max-w-xl flex-col gap-10">
          <ProviderCategoryList label="If closed" options={[ifOption]} selectedKey={null} notNeeded={false} onChoose={noop} onToggleNotNeeded={noop} />
          <div className="pb-36">
            <ProviderCategoryList label="If selected, popover open" options={[ifOption]} selectedKey="insurance-if" notNeeded={false} onChoose={noop} onToggleNotNeeded={noop} />
          </div>
          <div className="pb-36">
            <DiscountBadge discount={designDiscount} defaultOpen defaultCopied />
          </div>
          <ProviderCategoryList label="If without url" options={[{ ...ifOption, url: null }]} selectedKey={null} notNeeded={false} onChoose={noop} onToggleNotNeeded={noop} />
        </div>
      </DesignSection>

      <DesignSection id="insurance-explainer" title="Insurance explainer" description="Always visible under the Home insurance heading, above the options. A calm surface with a lead line and three neutral points; nothing promises coverage.">
        <div className="max-w-xl">
          <InsuranceExplainer />
        </div>
      </DesignSection>

      <DesignSection id="settle-in-progress" title="Settle in progress" description="The progress line under the Settle in title. A category is handled when a provider is chosen or N/A is selected.">
        <div className="flex flex-col gap-4">
          <SettleInProgress handled={0} total={3} />
          <SettleInProgress handled={2} total={3} />
          <SettleInProgress handled={3} total={3} />
        </div>
      </DesignSection>

      <DesignSection id="discount-badge" title="Discount badge" description="Opens on hover, keyboard focus or tap. The Copy button copies the code and shows Copied for two seconds.">
        <div className="flex flex-wrap items-start gap-8">
          <DiscountBadge discount={designDiscount} />
          <div className="pb-32">
            <DiscountBadge discount={designDiscount} defaultOpen />
          </div>
        </div>
      </DesignSection>

      <DesignSection id="summary" title="Summary" description="The ending screen. Print hides the stepper and buttons. Shown with and without chosen providers, and with open and handled move checklist groups.">
        <div className="flex flex-col gap-10">
          <SummaryView summary={designSummary} onChecklistStatusChange={noop} reportHref="/design#summary" chosen={[{ category: 'internet', name: 'Internet Provider B', discount: null }, { category: 'home_insurance', name: 'If', discount: designDiscount }]} />
          <SummaryView summary={{ ...designSummary, moveDate: null, watchListDueDate: null, checklist: { open: [], handled: allHandled } }} onChecklistStatusChange={noop} reportHref="/design#summary" chosen={[]} />
        </div>
      </DesignSection>

      <DesignSection id="room-select" title="Room select" description="Default, disabled. Opens with Enter or Space.">
        <div className="grid max-w-md grid-cols-2 gap-4">
          <RoomSelect value="kitchen" onValueChange={() => undefined} label="Room (default)" />
          <RoomSelect value="bedroom" onValueChange={() => undefined} label="Room (disabled)" disabled />
        </div>
      </DesignSection>

      <DesignSection id="photo-uploader" title="Photo uploader" description="Choose or drop photos, label each, remove before upload. Add files to see the preview, room limit and upload states.">
        <PhotoUploader maxPerRoom={MAX_PHOTOS_PER_ROOM.before} existingCounts={{ kitchen: 3 }} upload={() => new Promise((resolve) => setTimeout(resolve, 1500))} />
        <PhotoUploader maxPerRoom={MAX_PHOTOS_PER_ROOM.before} existingCounts={{}} upload={() => Promise.reject(new Error('Upload failed'))} />
        <div className="max-w-md">
          <PhotoUploader maxPerRoom={MAX_PHOTOS_PER_ROOM.before} existingCounts={{}} upload={() => Promise.resolve()} disabled />
        </div>
      </DesignSection>

      <DesignSection id="photo-grid" title="Photo grid" description="Grouped by room, with relabel and delete. Populated, disabled and empty.">
        <PhotoGrid photos={samplePhotos} onRelabel={() => undefined} onDelete={() => undefined} />
        <PhotoGrid photos={samplePhotos.slice(0, 1)} onRelabel={() => undefined} onDelete={() => undefined} disabled />
        <PhotoGrid photos={[]} onRelabel={() => undefined} onDelete={() => undefined} />
      </DesignSection>

      <DesignSection id="room-checks" title="Room checks list" description="The right side of an open room card: AI and your own checks, remove, add. Populated, analyzing, empty, disabled and add error. Submit an empty field to see the error.">
        <div className="grid gap-6 lg:grid-cols-2">
          <RoomCheckList room="kitchen" checks={sampleChecks} onAdd={() => new Promise((resolve) => setTimeout(resolve, 800))} onDelete={() => undefined} />
          <RoomCheckList room="bedroom" checks={[]} analyzing onAdd={() => Promise.resolve()} onDelete={() => undefined} />
          <RoomCheckList room="bathroom" checks={[]} onAdd={() => Promise.reject(new Error('Could not add the check'))} onDelete={() => undefined} />
          <RoomCheckList room="hallway" checks={sampleChecks.slice(0, 1)} disabled onAdd={() => Promise.resolve()} onDelete={() => undefined} />
        </div>
      </DesignSection>

      <DesignSection id="room-card" title="Room card" description="One per room with photos. The cover is the first photo. Default, Analyzed once the AI wrote checks for the room, loading while the AI works, failed with a per-room Try again, no checks yet and several photos. The footer has two rows: the full room name (wraps only if very long), then the badges, which wrap onto a new line when they do not fit. The whole card is a button.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li><RoomCard room="kitchen" photos={samplePhotos.slice(0, 1)} checkCount={7} aiCheckCount={7} onOpen={() => undefined} /></li>
          <li><RoomCard room="bedroom" photos={samplePhotos.slice(2)} checkCount={0} analyzing onOpen={() => undefined} /></li>
          <li><RoomCard room="bathroom" photos={samplePhotos.slice(2)} checkCount={0} failed onRetry={() => undefined} onOpen={() => undefined} /></li>
          <li><RoomCard room="hallway" photos={samplePhotos.slice(2)} checkCount={0} onOpen={() => undefined} /></li>
          <li><RoomCard room="living_room" photos={[...samplePhotos, ...samplePhotos.slice(0, 1)]} checkCount={1} aiCheckCount={1} onOpen={() => undefined} /></li>
        </ul>
      </DesignSection>

      <DesignSection id="room-dialog" title="Room card dialog" description="Opens a room as a split view: photos on the left, room checks on the right. Full screen below lg, and the photo stacks on top. Arrow buttons or the left and right arrow keys move between rooms, and they are hidden for a single room. Escape closes.">
        <div className="flex flex-wrap gap-3">
          <RoomDialogDemo label="Open with three rooms" rooms={['kitchen', 'bedroom', 'hallway']} photos={designDialogPhotos} checks={sampleChecks} />
          <RoomDialogDemo label="Open while analyzing" rooms={['bedroom']} photos={designDialogPhotos} checks={[]} analyzing />
        </div>
      </DesignSection>

      <DesignSection id="room-checks-section" title="Room checks in the side panel" description="Read-only and collapsed by default, under the move checklist. One row per room with its count. A room opens that room's card on Before photos. From Move-in on it shows answered of total and opens the Move-in card. Hidden when there are no room checks.">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="max-w-sm">
            <RoomChecksSection checks={[...sampleChecks, ...sampleChecks.slice(0, 1).map((check) => ({ ...check, id: '00000000-0000-4000-8000-000000000199', room: 'bedroom' as const }))]} />
          </div>
          <div className="max-w-sm">
            <p className="text-sm text-muted-foreground">With no room checks the section is not rendered.</p>
            <RoomChecksSection checks={[]} />
          </div>
        </div>
      </DesignSection>

      <MoveInDesignSections />

      <DesignSection id="ai-error" title="AI error alert and analyze button" description="Shown when the AI fails. Retry is hidden when AI is not configured.">
        <AiErrorAlert title="The AI could not analyze your photos" message="The AI rate limit was reached. Try again later or add checks by hand." onRetry={() => undefined} />
        <AiErrorAlert title="The AI could not analyze your photos" message="The AI took too long to answer." onRetry={() => undefined} retrying />
        <AiErrorAlert title="AI is not set up" message="Add your checks by hand below, then continue." />
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <SparklesIcon data-icon="inline-start" />
            Analyze photos
          </Button>
          <Button disabled aria-busy="true">
            <Spinner data-icon="inline-start" />
            Analyzing
          </Button>
          <Button disabled>
            <SparklesIcon data-icon="inline-start" />
            Analyze photos
          </Button>
        </div>
      </DesignSection>

      <DesignSection
        id="finding-row"
        title="Finding row"
        description="One AI or user finding: thumbnails (click to enlarge), status, confidence, the related check, the current answer and the resolve controls. Press Issue or Write my own to see the note field. Saving with an empty custom answer shows the error."
      >
        <Card>
          <CardContent>
            <div className="divide-y">
              {sampleFindings.map(({ title, finding, disabled }) => (
                <div key={title} className="py-2">
                  <p className="text-sm text-muted-foreground">{title}</p>
                  <ul>
                    <FindingRow finding={finding} disabled={disabled} onResolve={() => new Promise((resolve) => setTimeout(resolve, 800))} onDelete={() => undefined} />
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ul>
          <FindingRow
            finding={{ ...baseFinding, id: '00000000-0000-4000-8000-000000000305' }}
            onResolve={() => Promise.reject(new Error('Could not save your answer'))}
            onDelete={() => undefined}
          />
        </ul>
        <p className="text-sm text-muted-foreground">Above: save fails with an error.</p>
      </DesignSection>

      <DesignSection id="enlargeable-photo" title="Enlargeable photo and add-an-issue form" description="Click the thumbnail to open it in a dialog. The form shows its error when submitted empty.">
        <div className="flex flex-wrap gap-4">
          <EnlargeablePhoto photo={samplePhotos[0] as Photo} label="Before photo of the kitchen" />
          <EnlargeablePhoto photo={sampleMoveInPhotos[0] as Photo} label="Move-in photo of the kitchen" />
          <EnlargeablePhoto photo={sampleMoveInPhotos[0] as Photo} label="Large photo of the kitchen" className="w-full max-w-sm" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <AddFindingForm room="kitchen" onAdd={() => new Promise((resolve) => setTimeout(resolve, 800))} />
          <AddFindingForm room="bedroom" onAdd={() => Promise.reject(new Error('Could not add the issue'))} />
          <AddFindingForm room="hallway" onAdd={() => Promise.resolve()} disabled />
        </div>
      </DesignSection>

      <DesignSection id="compare" title="Compare button, counter and notices" description="The button while comparing, with findings, and disabled. Failed rooms offer a retry, skipped rooms are a plain note.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <ScanSearchIcon data-icon="inline-start" />
            Compare photos
          </Button>
          <Button>
            <ScanSearchIcon data-icon="inline-start" />
            Re-run comparison (clears your answers for these rooms)
          </Button>
          <Button disabled aria-busy="true">
            <Spinner data-icon="inline-start" />
            Comparing
          </Button>
          <Button disabled>
            <ScanSearchIcon data-icon="inline-start" />
            Compare photos
          </Button>
        </div>
        <p className="text-heading">7 of 9 resolved</p>
        <AiErrorAlert title="Some rooms could not be compared" message="Bedroom failed. The other rooms were saved." onRetry={() => undefined} />
        <AiErrorAlert title="AI is not set up" message="Add the issues you see by hand below." />
        <p className="text-sm text-muted-foreground">Skipped Bedroom, Balcony: a room needs both before and move-in photos to be compared.</p>
      </DesignSection>

      <DesignSection
        id="report"
        title="Report"
        description="The ReportIssue block, then the full report as it prints, with issues and with none. Photo captions say when each photo was uploaded. The buttons are the ones on the Move-in and Report steps."
      >
        <Card>
          <CardContent>
            <ul className="divide-y">
              <ReportIssue issue={sampleReport.snapshot.issues[0] as (typeof sampleReport.snapshot.issues)[number]} />
              <ReportIssue issue={sampleReport.snapshot.issues[1] as (typeof sampleReport.snapshot.issues)[number]} />
            </ul>
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">
            <FileTextIcon data-icon="inline-start" />
            Generate report
          </Button>
          <Button size="lg" disabled aria-busy="true">
            <Spinner data-icon="inline-start" />
            Generating
          </Button>
          <Button size="lg" disabled>
            <FileTextIcon data-icon="inline-start" />
            Generate report
          </Button>
          <span className="text-sm text-muted-foreground">Answer the 2 remaining findings first.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <PrinterIcon data-icon="inline-start" />
            Print / Save as PDF
          </Button>
          <Button variant="secondary">
            <RefreshCwIcon data-icon="inline-start" />
            Regenerate
          </Button>
          <Button variant="secondary" disabled aria-busy="true">
            <Spinner data-icon="inline-start" />
            Generating
          </Button>
        </div>
        <AiErrorAlert title="Could not generate the report" message="Answer every finding before generating the report" />
        <Card>
          <CardContent>
            <ReportView report={sampleReport} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ReportView report={zeroIssueReport} />
          </CardContent>
        </Card>
      </DesignSection>

      <DesignSection id="move-form" title="Create-move fields" description="Address and optional move date.">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="grid content-start gap-6">
            <CreateMoveFields idPrefix="design-form-default" />
          </div>
          <div className="grid content-start gap-6">
            <CreateMoveFields idPrefix="design-form-error" addressError="Enter the address you are moving into" />
          </div>
          <div className="grid content-start gap-6">
            <CreateMoveFields idPrefix="design-form-disabled" disabled />
          </div>
        </div>
      </DesignSection>

      <DesignSection id="states" title="Empty, loading and error states">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseIcon />
            </EmptyMedia>
            <EmptyTitle>No move yet</EmptyTitle>
            <EmptyDescription>Your move-in steps will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading
        </div>
        <Alert>
          <InfoIcon />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Different angles and lighting are expected between photos.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>Try again in a moment.</AlertDescription>
        </Alert>
      </DesignSection>

      <DesignSection id="header-nav" title="Header navigation" description="Ghost small buttons next to the logo in the move header. The link for the current page is highlighted and carries aria-current. Here Design is active and Demo is the default state.">
        <HeaderNav />
      </DesignSection>

      <DesignSection id="start-over" title="Start over" description="Small secondary button in the move header. It opens a confirm dialog. The confirm button shows a spinner while deleting, and a failure shows an alert inside the dialog.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setStartOverState('default')}>
            Start over
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setStartOverState('loading')}>
            Dialog: loading
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setStartOverState('error')}>
            Dialog: error
          </Button>
        </div>
        <StartOverDialog
          open={startOverState !== null}
          onOpenChange={(open) => !open && setStartOverState(null)}
          onConfirm={() => undefined}
          pending={startOverState === 'loading'}
          error={startOverState === 'error' ? 'Could not delete everything. Try again.' : undefined}
        />
      </DesignSection>

      <DesignSection id="background" title="Interactive background" description="Landing page canvas. Follows the pointer; static under reduced motion.">
        <div className="relative h-72 overflow-hidden rounded-xl border bg-background">
          <InteractiveBackground />
        </div>
      </DesignSection>
    </div>
  );
}
