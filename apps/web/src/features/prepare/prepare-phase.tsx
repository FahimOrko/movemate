import type { ChecklistItem as ChecklistItemData, Move } from '@movemate/contracts';
import { CircleAlertIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ChecklistItem } from '@/components/checklist-item';
import { TipCard } from '@/components/tip-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAdvanceMove } from './use-move';
import { usePrepareGuidance, useProgress, useSetProgress } from './use-prepare';

function groupByCategory(items: ChecklistItemData[]): [string, ChecklistItemData[]][] {
  const groups = new Map<string, ChecklistItemData[]>();
  for (const item of items) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  return [...groups];
}

export function PreparePhase({ move }: { move: Move }) {
  const navigate = useNavigate();
  const guidance = usePrepareGuidance();
  const progress = useProgress(move.id);
  const setProgress = useSetProgress(move.id);
  const advance = useAdvanceMove();

  if (guidance.isError || progress.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load your checklist</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (!guidance.data || !progress.data) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const completedKeys = new Set(progress.data.filter((entry) => entry.completed).map((entry) => entry.itemKey));
  const { checklist, tips } = guidance.data;

  function continueToNextPhase() {
    advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <section aria-labelledby="checklist-title" className="flex flex-col gap-8 lg:col-span-2">
        <div>
          <h1 id="checklist-title" className="text-title">
            Prepare
          </h1>
          <p className="mt-2 text-muted-foreground" aria-live="polite">
            {completedKeys.size} of {checklist.length} done
          </p>
        </div>
        {groupByCategory(checklist).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-heading">{category}</h2>
            <div className="mt-1 divide-y">
              {items.map((item) => (
                <ChecklistItem
                  key={item.key}
                  title={item.title}
                  description={item.description}
                  checked={completedKeys.has(item.key)}
                  onCheckedChange={(completed) => setProgress.mutate({ itemKey: item.key, completed })}
                />
              ))}
            </div>
          </div>
        ))}
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
      </section>
      <aside aria-labelledby="tips-title" className="flex flex-col gap-4">
        <h2 id="tips-title" className="text-heading">
          Planning tips
        </h2>
        {tips.map((tip) => (
          <TipCard key={tip.key} title={tip.title} body={tip.body} />
        ))}
      </aside>
    </div>
  );
}
