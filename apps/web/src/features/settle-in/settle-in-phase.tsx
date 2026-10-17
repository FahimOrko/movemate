import type { Move, ProviderCategory } from '@movemate/contracts';
import { ArrowRightIcon, CircleAlertIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ChecklistNaNote } from '@/components/checklist-na-note';
import { ProviderHeroCard } from '@/components/provider-hero-card';
import { ProviderOptionList } from '@/components/provider-option-list';
import { SettleInProgress } from '@/components/settle-in-progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useChecklist } from '@/features/checklist/use-checklist';
import { useAdvanceMove } from '@/features/prepare/use-move';
import { providerCategoryLabels } from '@/lib/provider-categories';
import { useProviderSelection, useSetProviderSelection, useSettleInGuidance } from './use-settle-in';

const categoryOrder: ProviderCategory[] = ['home_insurance', 'electricity', 'internet'];

export function SettleInPhase({ move }: { move: Move }) {
  const navigate = useNavigate();
  const guidance = useSettleInGuidance();
  const selection = useProviderSelection(move.id);
  const setSelection = useSetProviderSelection(move.id);
  const checklist = useChecklist(move.id);
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
  const chosenCount = categoryOrder.filter((category) => selection.data[category] !== null).length;
  const choose = (category: ProviderCategory, providerKey: string) =>
    setSelection.mutate({ category, providerKey: selection.data[category] === providerKey ? null : providerKey });
  const insurers = providers.filter((provider) => provider.category === 'home_insurance');
  const hero = insurers.find((provider) => provider.highlighted);
  const otherInsurers = insurers.filter((provider) => provider !== hero);
  const listCategories = categoryOrder.filter((category) => category !== 'home_insurance');

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-title">Settle in</h1>
        <p className="text-muted-foreground">Set up home insurance, electricity and internet for your new home.</p>
        <SettleInProgress chosen={chosenCount} total={categoryOrder.length} />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">{providerCategoryLabels.home_insurance}</h2>
        {checklist.data?.some((entry) => entry.linkedCategory === 'home_insurance' && entry.status === 'na') && <ChecklistNaNote />}
        {hero && (
          <ProviderHeroCard
            name={hero.name}
            explainerTitle={explainer.title}
            url={hero.url}
            discount={hero.discount}
            selected={selection.data.home_insurance === hero.key}
            onSelect={() => choose('home_insurance', hero.key)}
          />
        )}
        {otherInsurers.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">Other options</h3>
            <ProviderOptionList label="Other home insurance options" options={otherInsurers} selectedKey={selection.data.home_insurance} compact onChoose={(key) => choose('home_insurance', key)} />
          </div>
        )}
      </div>
      {listCategories.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{providerCategoryLabels[category]}</h2>
          {checklist.data?.some((entry) => entry.linkedCategory === category && entry.status === 'na') && <ChecklistNaNote />}
          <ProviderOptionList label={providerCategoryLabels[category]} options={providers.filter((provider) => provider.category === category)} selectedKey={selection.data[category]} onChoose={(key) => choose(category, key)} />
        </div>
      ))}
      {advance.isError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not finish</AlertTitle>
          <AlertDescription>{advance.error.message}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <SettleInProgress chosen={chosenCount} total={categoryOrder.length} />
          <p className="text-sm text-muted-foreground">Choices are optional. You can change them later.</p>
        </div>
        <Button size="lg" disabled={advance.isPending} onClick={() => advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) })}>
          {advance.isPending && <Spinner data-icon="inline-start" />}
          Finish
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
