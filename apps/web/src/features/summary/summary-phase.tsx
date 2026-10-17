import { providerCategories, type Move } from '@movemate/contracts';
import { CircleAlertIcon, PrinterIcon } from 'lucide-react';
import { SummaryView, type ChosenProvider } from '@/components/summary-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSetChecklistStatus } from '@/features/checklist/use-checklist';
import { useProviderSelection, useSettleInGuidance } from '@/features/settle-in/use-settle-in';
import { useSummary } from './use-summary';

export function SummaryPhase({ move }: { move: Move }) {
  const summary = useSummary(move.id);
  const selection = useProviderSelection(move.id);
  const guidance = useSettleInGuidance();
  const setStatus = useSetChecklistStatus(move.id);

  if (summary.isError || selection.isError || guidance.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load your summary</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (summary.isPending || selection.isPending || guidance.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const chosen = providerCategories.flatMap((category): ChosenProvider[] => {
    const provider = guidance.data.providers.find((candidate) => candidate.key === selection.data[category]);
    return provider ? [{ category, name: provider.name, discount: provider.discount }] : [];
  });

  return (
    <section className="flex flex-col gap-8">
      <SummaryView
        summary={summary.data}
        chosen={chosen}
        reportHref="/move/report"
        onChecklistStatusChange={(itemKey, status) => setStatus.mutate({ itemKey, status })}
      />
      <div className="print:hidden">
        <Button onClick={() => window.print()}>
          <PrinterIcon data-icon="inline-start" />
          Print / Save as PDF
        </Button>
      </div>
    </section>
  );
}
