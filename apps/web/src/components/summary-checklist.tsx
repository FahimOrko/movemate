import type { ChecklistStatus, GuidanceProgress, ReportSummary } from '@movemate/contracts';
import { ChecklistRow } from '@/components/checklist-row';
import { checklistStatusLabels } from '@/lib/checklist-status';

type SummaryChecklistProps = {
  checklist: ReportSummary['checklist'];
  onStatusChange: (itemKey: string, status: ChecklistStatus) => void;
};

function Rows({ entries, onStatusChange }: { entries: GuidanceProgress[]; onStatusChange: SummaryChecklistProps['onStatusChange'] }) {
  return (
    <div className="divide-y">
      {entries.map((entry) => (
        <ChecklistRow
          key={entry.key}
          title={entry.title}
          description={entry.description}
          status={entry.status}
          onStatusChange={(status) => onStatusChange(entry.key, status)}
        />
      ))}
    </div>
  );
}

export function SummaryChecklist({ checklist, onStatusChange }: SummaryChecklistProps) {
  const all = [...checklist.open, ...checklist.handled];
  return (
    <section aria-labelledby="checklist-summary-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 print:hidden">
        <h2 id="checklist-summary-title" className="text-heading">
          Still open
        </h2>
        {checklist.open.length === 0 ? (
          <p className="text-muted-foreground">Everything on your move checklist is handled.</p>
        ) : (
          <Rows entries={checklist.open} onStatusChange={onStatusChange} />
        )}
        {checklist.handled.length > 0 && (
          <details className="group">
            <summary className="w-fit cursor-pointer rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              Handled ({checklist.handled.length})
            </summary>
            <Rows entries={checklist.handled} onStatusChange={onStatusChange} />
          </details>
        )}
      </div>
      <div className="hidden print:block">
        <h2 className="text-heading">Move checklist</h2>
        <ul className="mt-2 divide-y">
          {all.map((entry) => (
            <li key={entry.key} className="flex justify-between gap-4 py-2 text-sm">
              <span>{entry.title}</span>
              <span>{checklistStatusLabels[entry.status]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
