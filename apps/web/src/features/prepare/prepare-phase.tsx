import type { Move } from '@movemate/contracts';
import { CircleAlertIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TipCard } from '@/components/tip-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAdvanceMove } from './use-move';
import { usePrepareGuidance } from './use-prepare';

export function PreparePhase({ move }: { move: Move }) {
  const navigate = useNavigate();
  const guidance = usePrepareGuidance();
  const advance = useAdvanceMove();

  if (guidance.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load your planning tips</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (!guidance.data) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const { tips } = guidance.data;

  function continueToNextPhase() {
    advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) });
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="prepare-title">
        <h1 id="prepare-title" className="text-title">
          Prepare
        </h1>
        <p className="mt-2 text-muted-foreground">Work through the checklist as you go. You can continue at any time.</p>
      </section>
      <section aria-labelledby="tips-title" className="flex flex-col gap-4">
        <h2 id="tips-title" className="text-heading">
          Planning tips
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tips.map((tip) => (
            <TipCard key={tip.key} title={tip.title} body={tip.body} />
          ))}
        </div>
      </section>
      {advance.isError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not continue</AlertTitle>
          <AlertDescription>{advance.error.message}</AlertDescription>
        </Alert>
      )}
      <div>
        <Button size="lg" onClick={continueToNextPhase} disabled={advance.isPending}>
          {advance.isPending && <Spinner data-icon="inline-start" />}
          Continue to before photos
        </Button>
      </div>
    </div>
  );
}
