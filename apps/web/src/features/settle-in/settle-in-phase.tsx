import type { Move, ProviderCategory } from '@movemate/contracts';
import { ArrowRightIcon, CircleAlertIcon, ShieldCheckIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProviderCard } from '@/components/provider-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useAdvanceMove } from '@/features/prepare/use-move';
import { providerCategoryLabels } from '@/lib/provider-categories';
import { useProviderSelection, useSetProviderSelection, useSettleInGuidance } from './use-settle-in';

export function SettleInPhase({ move }: { move: Move }) {
  const navigate = useNavigate();
  const guidance = useSettleInGuidance();
  const selection = useProviderSelection(move.id);
  const setSelection = useSetProviderSelection(move.id);
  const advance = useAdvanceMove();

  if (guidance.isError || selection.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load providers</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (guidance.isPending || selection.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const { explainer, providers } = guidance.data;
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-title">Settle in</h1>
        <p className="mt-2 text-muted-foreground">Set up electricity, internet and home insurance for your new home.</p>
      </div>
      <Card variant="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {explainer.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">{explainer.body}</CardContent>
      </Card>
      {(Object.keys(providerCategoryLabels) as ProviderCategory[]).map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{providerCategoryLabels[category]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {providers
              .filter((provider) => provider.category === category)
              .map((provider) => (
                <ProviderCard
                  key={provider.key}
                  name={provider.name}
                  highlighted={provider.highlighted}
                  url={provider.url}
                  discount={provider.discount}
                  selected={selection.data[category] === provider.key}
                  onSelect={() => setSelection.mutate({ category, providerKey: selection.data[category] === provider.key ? null : provider.key })}
                />
              ))}
          </div>
        </div>
      ))}
      {advance.isError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not finish</AlertTitle>
          <AlertDescription>{advance.error.message}</AlertDescription>
        </Alert>
      )}
      <div>
        <Button size="lg" disabled={advance.isPending} onClick={() => advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) })}>
          {advance.isPending && <Spinner data-icon="inline-start" />}
          Finish
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
