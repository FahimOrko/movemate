import { providerCategories, type Move, type ProviderCategory } from '@movemate/contracts';
import { CircleAlertIcon, PrinterIcon } from 'lucide-react';
import { Link } from 'react-router';
import { SummaryView } from '@/components/summary-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSetChecklistStatus } from '@/features/checklist/use-checklist';
import { useProviderSelection, useSettleInGuidance } from '@/features/settle-in/use-settle-in';
import { ApiError } from '@/lib/api';
import { useSummary } from './use-summary';

export function SummaryPhase({ move }: { move: Move }) {
  const summary = useSummary(move.id);
  const selection = useProviderSelection(move.id);
  const guidance = useSettleInGuidance();
  const setStatus = useSetChecklistStatus(move.id);

  if (summary.error instanceof ApiError && summary.error.code === 'report_outdated') {
    return (
      <Alert>
        <CircleAlertIcon />
        <AlertTitle>Your report needs to be regenerated</AlertTitle>
        <AlertDescription>
          The summary is built from the report.{' '}
          <Link to="/move/report" className="underline underline-offset-4">
            Open the report and regenerate it.
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
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

  const discountCodes: Partial<Record<ProviderCategory, string>> = {};
  for (const category of providerCategories) {
    const provider = guidance.data.providers.find((candidate) => candidate.key === selection.data[category]);
    if (provider?.discount) discountCodes[category] = provider.discount.code;
  }

  return (
    <section className="flex flex-col gap-8">
      <SummaryView
        summary={summary.data}
        discountCodes={discountCodes}
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
