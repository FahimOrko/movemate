import type { Move } from '@movemate/contracts';
import { FileTextIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AiErrorAlert } from '@/components/ai-error-alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePhotos } from '@/features/photos/use-photos';
import { useGenerateReport } from '@/features/report/use-report';
import { useFindings } from './use-findings';

export function GenerateReportButton({ move }: { move: Move }) {
  const navigate = useNavigate();
  const findings = useFindings(move.id);
  const moveInPhotos = usePhotos(move.id, 'move_in');
  const generate = useGenerateReport(move.id);

  const pendingCount = findings.data?.filter((finding) => finding.resolution === 'pending').length ?? 0;
  const hint = !findings.data || !moveInPhotos.data
    ? ''
    : moveInPhotos.data.length === 0
      ? 'Add move-in photos to generate the report.'
      : pendingCount > 0
        ? `Answer the ${pendingCount} remaining ${pendingCount === 1 ? 'finding' : 'findings'} first.`
        : '';
  const disabled = !findings.data || !moveInPhotos.data || hint !== '' || generate.isPending;

  return (
    <section aria-labelledby="report-title" className="flex flex-col gap-4">
      <div>
        <h2 id="report-title" className="text-heading">
          Generate the report
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          The report records your answers with the photos. You can have a report with no issues if everything looked fine.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" disabled={disabled} onClick={() => generate.mutate(undefined, { onSuccess: () => navigate('/move/report') })}>
          {generate.isPending ? <Spinner data-icon="inline-start" /> : <FileTextIcon data-icon="inline-start" />}
          {generate.isPending ? 'Generating' : 'Generate report'}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {hint}
        </p>
      </div>
      {generate.isError && <AiErrorAlert title="Could not generate the report" message={generate.error.message} />}
    </section>
  );
}
