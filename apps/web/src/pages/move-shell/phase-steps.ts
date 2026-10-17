import { phaseOrder, type Phase } from '@movemate/contracts';
import type { StepState } from '@/components/stepper';

/**
 * Stepper state per phase, derived from data. `prepareOpenCount` is null while the checklist loads,
 * which falls back to phase order. Wire another phase's attention state by returning it here.
 */
export function phaseSteps(reached: Phase, prepareOpenCount: number | null): Record<Phase, StepState> {
  const reachedIndex = phaseOrder.indexOf(reached);
  const steps = {} as Record<Phase, StepState>;
  for (const [index, phase] of phaseOrder.entries()) {
    steps[phase] = index > reachedIndex ? { state: 'locked' } : { state: index < reachedIndex ? 'complete' : 'upcoming' };
  }
  if (prepareOpenCount === null) return steps;
  if (prepareOpenCount === 0) steps.prepare = { state: 'complete' };
  else if (reachedIndex > 0) steps.prepare = { state: 'attention', label: `${prepareOpenCount} ${prepareOpenCount === 1 ? 'item' : 'items'} still open` };
  else steps.prepare = { state: 'upcoming' };
  return steps;
}
