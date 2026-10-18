import type { Move } from '@movemate/contracts';
import { ArrowRightIcon, CircleAlertIcon, FileTextIcon, PrinterIcon, RefreshCwIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ReportView } from '@/components/report-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api';
import { useAdvanceMove } from '@/features/prepare/use-move';
import { useGenerateReport, useLatestReport } from './use-report';

export function ReportPhase({ move }: { move: Move }) {
  const navigate = useNavigate();
  const latest = useLatestReport(move.id);
  const generate = useGenerateReport(move.id);
  const advance = useAdvanceMove();
  const actionError = generate.error ?? advance.error;

  const outdated = latest.error instanceof ApiError && latest.error.code === 'report_outdated';
  if (latest.isError && !outdated) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load your report</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (latest.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const report = latest.data;
  const emptyTitle = outdated ? 'This report is from an older version' : 'No report yet';
  const emptyDescription = outdated ? 'Regenerate this report to see it with the full record of your move.' : 'Answer every finding on the move-in step, then generate your report.';
  const generateButton = (label: string, variant: 'default' | 'secondary') => (
    <Button variant={variant} disabled={generate.isPending} onClick={() => generate.mutate()}>
      {generate.isPending ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
      {generate.isPending ? 'Generating' : label}
    </Button>
  );

  return (
    <section className="flex flex-col gap-8">
      {actionError && (
        <Alert variant="destructive" className="print:hidden">
          <CircleAlertIcon />
          <AlertTitle>That did not work</AlertTitle>
          <AlertDescription>{actionError.message}</AlertDescription>
        </Alert>
      )}
      {report ? (
        <>
          <div className="flex flex-wrap gap-3 print:hidden">
            <Button onClick={() => window.print()}>
              <PrinterIcon data-icon="inline-start" />
              Print / Save as PDF
            </Button>
            {generateButton('Regenerate', 'secondary')}
          </div>
          <ReportView report={report} />
          <div className="print:hidden">
            <Button
              size="lg"
              variant="secondary"
              disabled={advance.isPending}
              onClick={() => advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) })}
            >
              {advance.isPending && <Spinner data-icon="inline-start" />}
              Continue to settle in
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          {generateButton(outdated ? 'Regenerate this report' : 'Generate report', 'default')}
        </Empty>
      )}
    </section>
  );
}
