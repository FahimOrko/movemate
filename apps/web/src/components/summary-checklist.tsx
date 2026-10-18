import type { ChecklistStatus, GuidanceProgress, ProviderCategory, ReportSummary } from '@movemate/contracts';
import { ChecklistRow } from '@/components/checklist-row';
import { SummarySection } from '@/components/summary-section';
import { checklistStatusLabels } from '@/lib/checklist-status';

type SummaryChecklistProps = {
  checklist: ReportSummary['checklist'];
  onStatusChange: (itemKey: string, status: ChecklistStatus) => void;
  /** Discount code of the chosen provider per category (only If has one). */
  discountCodes: Partial<Record<ProviderCategory, string>>;
};

function Rows({ entries, onStatusChange, discountCodes }: Pick<SummaryChecklistProps, 'onStatusChange' | 'discountCodes'> & { entries: GuidanceProgress[] }) {
  return (
    <div className="divide-y">
      {entries.map((entry) => (
        <ChecklistRow
          key={entry.key}
          title={entry.title}
          description={entry.description}
          status={entry.status}
          linked={entry.linkedCategory !== undefined}
          locked={entry.locked}
          providerName={entry.providerName}
          discountCode={entry.linkedCategory ? discountCodes[entry.linkedCategory] : undefined}
          onStatusChange={(status) => onStatusChange(entry.key, status)}
        />
      ))}
    </div>
  );
}

export function SummaryChecklist({ checklist, onStatusChange, discountCodes }: SummaryChecklistProps) {
  const all = [...checklist.open, ...checklist.handled];
  const done = checklist.handled.length;
  return (
    <SummarySection id="checklist-summary-title" title="Move checklist">
      <div className="flex flex-col gap-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          {done} of {all.length} handled
        </p>
        <div
          role="progressbar"
          aria-label="Move checklist handled"
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-valuenow={done}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${all.length === 0 ? 0 : (done / all.length) * 100}%` }} />
        </div>
        <h3 className="font-medium">Still open</h3>
        {checklist.open.length === 0 ? (
          <p className="text-muted-foreground">Everything on your move checklist is handled.</p>
        ) : (
          <Rows entries={checklist.open} onStatusChange={onStatusChange} discountCodes={discountCodes} />
        )}
        {checklist.handled.length > 0 && (
          <details className="group">
            <summary className="w-fit cursor-pointer rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              Handled ({checklist.handled.length})
            </summary>
            <Rows entries={checklist.handled} onStatusChange={onStatusChange} discountCodes={discountCodes} />
          </details>
        )}
      </div>
      <div className="hidden print:block">
        <ul className="divide-y">
          {all.map((entry) => (
            <li key={entry.key} className="flex justify-between gap-4 py-2 text-sm break-inside-avoid">
              <span>
                {entry.title}
                {entry.providerName && (
                  <span className="text-muted-foreground">
                    {' '}
                    ({entry.providerName}
                    {entry.linkedCategory && discountCodes[entry.linkedCategory] && `, discount code ${discountCodes[entry.linkedCategory]}`})
                  </span>
                )}
              </span>
              <span>{checklistStatusLabels[entry.status]}</span>
            </li>
          ))}
        </ul>
      </div>
    </SummarySection>
  );
}
