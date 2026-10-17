import { linkedItemKeys, type Move, type ProviderCategory } from '@movemate/contracts';
import { ArrowRightIcon, CircleAlertIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { InsuranceInfoPopover } from '@/components/insurance-info-popover';
import { ProviderCategoryList } from '@/components/provider-category-list';
import { SettleInProgress } from '@/components/settle-in-progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useChecklist, useSetChecklistStatus } from '@/features/checklist/use-checklist';
import { useAdvanceMove } from '@/features/prepare/use-move';
import { providerCategoryLabels } from '@/lib/provider-categories';
import { PARTNER_TAG } from './partner-tag';
import { useProviderSelection, useSetProviderSelection, useSettleInGuidance } from './use-settle-in';

const categoryOrder: ProviderCategory[] = ['home_insurance', 'electricity', 'internet'];

export function SettleInPhase({ move }: { move: Move }) {
  const navigate = useNavigate();
  const guidance = useSettleInGuidance();
  const selection = useProviderSelection(move.id);
  const setSelection = useSetProviderSelection(move.id);
  const checklist = useChecklist(move.id);
  const setStatus = useSetChecklistStatus(move.id);
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
  if (guidance.isPending || selection.isPending || checklist.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const { providers } = guidance.data;
  const isNotNeeded = (category: ProviderCategory) =>
    checklist.data?.some((entry) => entry.linkedCategory === category && entry.status === 'na') ?? false;
  const handledCount = categoryOrder.filter((category) => selection.data[category] !== null || isNotNeeded(category)).length;
  const choose = (category: ProviderCategory, providerKey: string) =>
    setSelection.mutate({ category, providerKey: selection.data[category] === providerKey ? null : providerKey });
  const toggleNotNeeded = (category: ProviderCategory) =>
    setStatus.mutate({ itemKey: linkedItemKeys[category], status: isNotNeeded(category) ? 'pending' : 'na' });

  return (
    <section className="flex max-w-xl flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-title">Settle in</h1>
        <p className="text-muted-foreground">Set up home insurance, electricity and internet for your new home.</p>
        <SettleInProgress handled={handledCount} total={categoryOrder.length} />
      </div>
      {categoryOrder.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-medium">{providerCategoryLabels[category]}</h2>
            {category === 'home_insurance' && <InsuranceInfoPopover />}
          </div>
          <ProviderCategoryList
            label={providerCategoryLabels[category]}
            options={providers.filter((provider) => provider.category === category).map((provider) => ({ ...provider, tag: provider.highlighted ? PARTNER_TAG : undefined }))}
            selectedKey={selection.data[category]}
            notNeeded={isNotNeeded(category)}
            onChoose={(key) => choose(category, key)}
            onToggleNotNeeded={() => toggleNotNeeded(category)}
          />
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
        <p className="text-sm text-muted-foreground">Choices are optional. You can change them later.</p>
        <Button size="lg" disabled={advance.isPending} onClick={() => advance.mutate(move.id, { onSuccess: (next) => navigate(`/move/${next.phase}`) })}>
          {advance.isPending && <Spinner data-icon="inline-start" />}
          Finish
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
