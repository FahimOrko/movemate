import type { ChecklistStatus } from '@movemate/contracts';
import { CheckIcon, InfoIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { StatusControl } from '@/components/status-control';
import { cn } from '@/lib/utils';

type ChecklistRowProps = {
  title: string;
  description?: string;
  status: ChecklistStatus;
  onStatusChange: (status: ChecklistStatus) => void;
  disabled?: boolean;
  /** Linked items mirror a Settle in provider category. */
  linked?: boolean;
  /** Linked item before Settle in: answers are disabled. */
  locked?: boolean;
  providerName?: string | null;
  /** Starts with the description open. */
  defaultExpanded?: boolean;
};

export function ChecklistRow({ title, description, status, onStatusChange, disabled, linked, locked, providerName, defaultExpanded = false }: ChecklistRowProps) {
  const descriptionId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className={cn('py-2.5', (status === 'na' || locked) && 'opacity-60')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {status === 'done' && <CheckIcon className="size-4 shrink-0 text-success-text" aria-hidden="true" />}
          {status === 'no' && <span className="size-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />}
          <span className={cn('text-sm', (status === 'done' || status === 'na') && 'text-muted-foreground', status === 'done' && 'line-through')}>
            {title}
            {status === 'no' && <span className="sr-only"> (answered no)</span>}
          </span>
          {description && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={descriptionId}
              aria-label={`More about ${title}`}
              onClick={() => setExpanded((open) => !open)}
              className="shrink-0 rounded-full p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <InfoIcon className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <StatusControl value={status} onChange={onStatusChange} label={title} disabled={disabled || locked} />
      </div>
      {locked && <p className="mt-1 text-sm text-muted-foreground">You can choose this later in Settle in</p>}
      {linked && !locked && (
        <p className="mt-1 text-sm text-muted-foreground">
          {providerName && <span className="mr-2 font-medium text-foreground">{providerName}</span>}
          <Link to="/move/settle_in" className="rounded-sm underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40">
            Choose in Settle in
          </Link>
        </p>
      )}
      {description && expanded && (
        <p id={descriptionId} className="mt-1.5 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
