import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type OpenItemsStatusProps = {
  openChecks: number;
  openFindings: number;
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function openItemsText(openChecks: number, openFindings: number) {
  if (openChecks + openFindings === 0) return 'All done';
  const parts = [openChecks > 0 && plural(openChecks, 'room check', 'room checks'), openFindings > 0 && plural(openFindings, 'finding', 'findings')];
  return `${parts.filter(Boolean).join(' and ')} still open`;
}

export function OpenItemsStatus({ openChecks, openFindings }: OpenItemsStatusProps) {
  const done = openChecks + openFindings === 0;
  const Icon = done ? CircleCheckIcon : TriangleAlertIcon;
  return (
    <p className={cn('flex items-center gap-2 text-heading', done ? 'text-success-text' : 'text-warning-text')} aria-live="polite">
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {openItemsText(openChecks, openFindings)}
    </p>
  );
}
