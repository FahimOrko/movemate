import type { Move } from '@movemate/contracts';
import { ChecklistDrawer } from '@/components/checklist-drawer';
import { ChecklistPanel } from '@/components/checklist-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useChecklist, useSetChecklistStatus } from './use-checklist';

export function ChecklistSidebar({ move }: { move: Move }) {
  const checklist = useChecklist(move.id);
  const setStatus = useSetChecklistStatus(move.id);

  if (checklist.isError) return <p className="text-sm text-muted-foreground print:hidden">Checklist unavailable. Refresh to try again.</p>;
  if (!checklist.data) return <Skeleton className="h-48 w-full rounded-xl lg:w-80" aria-hidden="true" />;

  const onStatusChange = (itemKey: string, status: Parameters<typeof setStatus.mutate>[0]['status']) => setStatus.mutate({ itemKey, status });
  return (
    <>
      <div className="lg:hidden">
        <ChecklistDrawer entries={checklist.data} onStatusChange={onStatusChange} />
      </div>
      <aside aria-label="Checklist" className="hidden w-80 shrink-0 self-start lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
        <ChecklistPanel entries={checklist.data} onStatusChange={onStatusChange} />
      </aside>
    </>
  );
}
