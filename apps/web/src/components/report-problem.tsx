import type { ReportProblem as ReportProblemData } from '@movemate/contracts';
import { ReportPhotoGrid } from '@/components/report-photo-grid';
import { problemParts } from '@/lib/report-problem';

const PRINT_PHOTO_LIMIT = 3;

export function ReportProblem({ problem, roomLabel }: { problem: ReportProblemData; roomLabel: string }) {
  const { lead, secondary, sourceLabel } = problemParts(problem);
  return (
    <li className="flex flex-col gap-3 py-4 break-inside-avoid">
      <div className="flex max-w-prose flex-col gap-1">
        <p className="text-base">{lead}</p>
        {secondary && <p className="text-sm text-muted-foreground">{secondary}</p>}
        <p className="text-xs text-muted-foreground">{sourceLabel}</p>
      </div>
      <ReportPhotoGrid beforePhotos={problem.beforePhotos} moveInPhotos={problem.moveInPhotos} roomLabel={roomLabel} printLimit={PRINT_PHOTO_LIMIT} />
    </li>
  );
}
