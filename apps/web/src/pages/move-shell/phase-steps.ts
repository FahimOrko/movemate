import { phaseOrder, type Phase } from '@movemate/contracts';
import type { StepState } from '@/components/stepper';

const itemsLabel = (count: number) => `${count} ${count === 1 ? 'item' : 'items'} still open`;

/**
 * Stepper state per phase, derived from data. An open count is null while its data loads,
 * which falls back to phase order. Wire another phase's attention state by returning it here.
 * Move-in shows attention while any room check or finding is pending; it never blocks navigation.
 */
export function phaseSteps(reached: Phase, prepareOpenCount: number | null, moveInOpenCount: number | null = null): Record<Phase, StepState> {
  const reachedIndex = phaseOrder.indexOf(reached);
  const steps = {} as Record<Phase, StepState>;
  for (const [index, phase] of phaseOrder.entries()) {
    steps[phase] = index > reachedIndex ? { state: 'locked' } : { state: index < reachedIndex ? 'complete' : 'upcoming' };
  }
  if (moveInOpenCount !== null && moveInOpenCount > 0 && steps.move_in.state !== 'locked') steps.move_in = { state: 'attention', label: itemsLabel(moveInOpenCount) };
  if (prepareOpenCount === null) return steps;
  if (prepareOpenCount === 0) steps.prepare = { state: 'complete' };
  else if (reachedIndex > 0) steps.prepare = { state: 'attention', label: itemsLabel(prepareOpenCount) };
  else steps.prepare = { state: 'upcoming' };
  return steps;
}
