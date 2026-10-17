import { isHandled, phaseOrder, phaseSchema, type Move } from '@movemate/contracts';
import { Navigate, useOutletContext, useParams } from 'react-router';
import { Stepper } from '@/components/stepper';
import { ChecklistSidebar } from '@/features/checklist/checklist-sidebar';
import { useChecklist } from '@/features/checklist/use-checklist';
import { BeforePhotosPhase } from '@/features/before-photos/before-photos-phase';
import { MoveInPhase } from '@/features/move-in/move-in-phase';
import { SettleInPhase } from '@/features/settle-in/settle-in-phase';
import { ReportPhase } from '@/features/report/report-phase';
import { SummaryPhase } from '@/features/summary/summary-phase';
import { PreparePhase } from '@/features/prepare/prepare-phase';
import { phaseSteps } from './phase-steps';

export function MovePhasePage() {
  const move = useOutletContext<Move>();
  const checklist = useChecklist(move.id);
  const parsed = phaseSchema.safeParse(useParams().phase);
  const isReached = parsed.success && phaseOrder.indexOf(parsed.data) <= phaseOrder.indexOf(move.phase);
  if (!parsed.success || !isReached) return <Navigate to={`/move/${move.phase}`} replace />;
  const phase = parsed.data;
  const openCount = checklist.data ? checklist.data.filter((entry) => !isHandled(entry.status)).length : null;

  return (
    <div className="flex flex-col gap-10">
      <div className="print:hidden">
        <Stepper active={phase} steps={phaseSteps(move.phase, openCount)} hrefFor={(target) => `/move/${target}`} />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        <div className="min-w-0 flex-1 lg:order-first">
          {phase === 'prepare' ? (
            <PreparePhase move={move} />
          ) : phase === 'before_photos' ? (
            <BeforePhotosPhase move={move} />
          ) : phase === 'move_in' ? (
            <MoveInPhase move={move} />
          ) : phase === 'report' ? (
            <ReportPhase move={move} />
          ) : phase === 'settle_in' ? (
            <SettleInPhase move={move} />
          ) : (
            <SummaryPhase move={move} />
          )}
        </div>
        <div className="order-first shrink-0 print:hidden lg:order-last">
          <ChecklistSidebar move={move} />
        </div>
      </div>
    </div>
  );
}
