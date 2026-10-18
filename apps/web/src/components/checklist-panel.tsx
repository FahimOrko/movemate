import {
  type ChecklistStatus,
  type GuidanceProgress,
  type Phase,
  type RoomCheck,
} from "@movemate/contracts";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { ChecklistRow } from "@/components/checklist-row";
import { RoomChecksSection } from "@/components/room-checks-section";
import { Button } from "@/components/ui/button";
import { countChecklist } from "@/lib/checklist-status";

type ChecklistPanelProps = {
  entries: GuidanceProgress[];
  onStatusChange: (itemKey: string, status: ChecklistStatus) => void;
  /** Read-only room checks shown under the move checklist when there are any. */
  roomChecks?: RoomCheck[];
  /** Phase being viewed; Move-in and later show answered counts and link to the Move-in cards. */
  phase?: Phase;
  onRoomNavigate?: () => void;
  /** Pass both to show the collapse toggle; the drawer omits them and stays expanded. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Same contract for the Room checks section, which collapses independently. */
  roomChecksCollapsed?: boolean;
  onRoomChecksCollapsedChange?: (collapsed: boolean) => void;
};

function groupByCategory(
  entries: GuidanceProgress[],
): [string, GuidanceProgress[]][] {
  const groups = new Map<string, GuidanceProgress[]>();
  for (const entry of entries)
    groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry]);
  return [...groups];
}

export function ChecklistPanel({
  entries,
  onStatusChange,
  roomChecks,
  phase,
  onRoomNavigate,
  collapsed,
  onCollapsedChange,
  roomChecksCollapsed,
  onRoomChecksCollapsedChange,
}: ChecklistPanelProps) {
  const { handled, done, na, left } = countChecklist(entries);
  const percent =
    entries.length === 0 ? 0 : Math.round((handled / entries.length) * 100);
  const roomSection = roomChecks && (
    <RoomChecksSection
      checks={roomChecks}
      phase={phase}
      onNavigate={onRoomNavigate}
      collapsed={roomChecksCollapsed}
      onCollapsedChange={onRoomChecksCollapsedChange}
    />
  );
  if (collapsed && onCollapsedChange) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          aria-expanded={false}
          aria-label="Expand Move checklist"
          onClick={() => onCollapsedChange(false)}
          className="flex w-full flex-col gap-2 rounded-xl border bg-card p-3 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-medium">Move checklist</span>
            <ChevronDownIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
          <span
            role="progressbar"
            aria-label="Checklist progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
          >
            <span
              className="block h-full rounded-full bg-success transition-[width] motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </span>
          <span className="text-sm text-muted-foreground">{`${done} done, ${na} N/A, ${left} left`}</span>
        </button>
        {roomSection}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-heading">Move checklist</h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {handled} of {entries.length} handled
          </p>
        </div>
        {onCollapsedChange && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={true}
            aria-label="Collapse Move checklist"
            onClick={() => onCollapsedChange(true)}
          >
            <ChevronUpIcon />
          </Button>
        )}
      </div>
      {groupByCategory(entries).map(([category, items]) => (
        <section key={category} aria-label={category}>
          <h3 className="text-sm font-medium text-muted-foreground">
            {category}
          </h3>
          <div className="divide-y">
            {items.map((item) => (
              <ChecklistRow
                key={item.key}
                title={item.title}
                description={item.description}
                linked={item.linkedCategory !== undefined}
                locked={item.locked}
                providerName={item.providerName}
                status={item.status}
                onStatusChange={(status) => onStatusChange(item.key, status)}
              />
            ))}
          </div>
        </section>
      ))}
      {roomSection}
    </div>
  );
}
