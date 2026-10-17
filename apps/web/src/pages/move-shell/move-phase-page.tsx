import { phaseOrder, phaseSchema, type Move } from '@movemate/contracts';
import { Navigate, useOutletContext, useParams } from 'react-router';
import { Stepper } from '@/components/stepper';
import { BeforePhotosPhase } from '@/features/before-photos/before-photos-phase';
import { MoveInPhase } from '@/features/move-in/move-in-phase';
import { SettleInPhase } from '@/features/settle-in/settle-in-phase';
import { ReportPhase } from '@/features/report/report-phase';
import { PreparePhase } from '@/features/prepare/prepare-phase';

export function MovePhasePage() {
  const move = useOutletContext<Move>();
  const parsed = phaseSchema.safeParse(useParams().phase);
  const isReached = parsed.success && phaseOrder.indexOf(parsed.data) <= phaseOrder.indexOf(move.phase);
  if (!parsed.success || !isReached) return <Navigate to={`/move/${move.phase}`} replace />;
  const phase = parsed.data;

  return (
    <div className="flex flex-col gap-10">
      <div className="print:hidden">
        <Stepper reached={move.phase} active={phase} hrefFor={(target) => `/move/${target}`} />
      </div>
      {phase === 'prepare' ? (
        <PreparePhase move={move} />
      ) : phase === 'before_photos' ? (
        <BeforePhotosPhase move={move} />
      ) : phase === 'move_in' ? (
        <MoveInPhase move={move} />
      ) : phase === 'report' ? (
        <ReportPhase move={move} />
      ) : (
        <SettleInPhase />
      )}
    </div>
  );
}
