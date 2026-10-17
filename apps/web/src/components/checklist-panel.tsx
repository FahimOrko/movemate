import { isHandled, type ChecklistStatus, type GuidanceProgress } from '@movemate/contracts';
import { ChecklistRow } from '@/components/checklist-row';

type ChecklistPanelProps = {
  entries: GuidanceProgress[];
  onStatusChange: (itemKey: string, status: ChecklistStatus) => void;
};

function groupByCategory(entries: GuidanceProgress[]): [string, GuidanceProgress[]][] {
  const groups = new Map<string, GuidanceProgress[]>();
  for (const entry of entries) groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry]);
  return [...groups];
}

export function ChecklistPanel({ entries, onStatusChange }: ChecklistPanelProps) {
  const handled = entries.filter((entry) => isHandled(entry.status)).length;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-heading">Checklist</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {handled} of {entries.length} handled
        </p>
      </div>
      {groupByCategory(entries).map(([category, items]) => (
        <section key={category} aria-label={category}>
          <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
          <div className="divide-y">
            {items.map((item) => (
              <ChecklistRow
                key={item.key}
                title={item.title}
                description={item.description}
                status={item.status}
                onStatusChange={(status) => onStatusChange(item.key, status)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
