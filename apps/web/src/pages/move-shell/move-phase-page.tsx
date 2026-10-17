import { phaseOrder, phaseSchema, type Move } from '@movemate/contracts';
import { HouseIcon } from 'lucide-react';
import { Navigate, useOutletContext, useParams } from 'react-router';
import { Stepper } from '@/components/stepper';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { BeforePhotosPhase } from '@/features/before-photos/before-photos-phase';
import { MoveInPhase } from '@/features/move-in/move-in-phase';
import { ReportPhase } from '@/features/report/report-phase';
import { PreparePhase } from '@/features/prepare/prepare-phase';
import { phaseLabels } from '@/lib/phases';

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
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseIcon />
            </EmptyMedia>
            <EmptyTitle>{phaseLabels[phase]}</EmptyTitle>
            <EmptyDescription>This step is not available yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
