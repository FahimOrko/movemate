import type { ProviderCategory } from '@movemate/contracts';
import { CircleAlertIcon, ShieldCheckIcon } from 'lucide-react';
import { ProviderCard } from '@/components/provider-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettleInGuidance } from './use-settle-in';

const categoryLabels: Record<ProviderCategory, string> = {
  electricity: 'Electricity',
  internet: 'Internet',
  home_insurance: 'Home insurance',
};

export function SettleInPhase() {
  const guidance = useSettleInGuidance();

  if (guidance.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load providers</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (guidance.isPending) {
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
      {(Object.keys(categoryLabels) as ProviderCategory[]).map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{categoryLabels[category]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {providers
              .filter((provider) => provider.category === category)
              .map((provider) => (
                <ProviderCard key={provider.key} name={provider.name} highlighted={provider.highlighted} url={provider.url} />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
