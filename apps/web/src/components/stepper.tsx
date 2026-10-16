import { phaseOrder, type Phase } from '@movemate/contracts';
import { CheckIcon, LockIcon } from 'lucide-react';
import { Link } from 'react-router';
import { phaseLabels } from '@/lib/phases';
import { cn } from '@/lib/utils';

type StepperProps = {
  /** Furthest phase unlocked. Later phases are locked. */
  reached: Phase;
  /** Phase being viewed. */
  active: Phase;
  hrefFor: (phase: Phase) => string;
};

const markerBase = 'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm';

export function Stepper({ reached, active, hrefFor }: StepperProps) {
  const reachedIndex = phaseOrder.indexOf(reached);
  return (
    <nav aria-label="Move phases">
      <ol className="flex items-center gap-2">
        {phaseOrder.map((phase, index) => {
          const isActive = phase === active;
          const isLocked = index > reachedIndex;
          const isDone = index < reachedIndex;
          const content = (
            <>
              <span
                className={cn(
                  markerBase,
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isDone && !isActive && 'border-success text-success-text',
                  isLocked && 'border-border text-muted-foreground',
                )}
              >
                {isLocked ? <LockIcon className="size-3.5" aria-hidden="true" /> : isDone && !isActive ? <CheckIcon className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className={cn('text-sm whitespace-nowrap', !isActive && 'hidden lg:inline', isLocked && 'text-muted-foreground')}>
                {phaseLabels[phase]}
                {isLocked && <span className="sr-only"> (locked)</span>}
              </span>
            </>
          );
          return (
            <li key={phase} className={cn('flex items-center gap-2', index < phaseOrder.length - 1 && 'flex-1 lg:flex-none')}>
              {isLocked ? (
                <span className="flex items-center gap-2" aria-disabled="true">
                  {content}
                </span>
              ) : (
                <Link
                  to={hrefFor(phase)}
                  aria-current={isActive ? 'step' : undefined}
                  className="flex items-center gap-2 rounded-full outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  {content}
                </Link>
              )}
              {index < phaseOrder.length - 1 && <span aria-hidden="true" className="h-px flex-1 bg-border lg:w-6 lg:flex-none" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
