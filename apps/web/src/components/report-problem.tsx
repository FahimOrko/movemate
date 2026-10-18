import type { ReportProblem as ReportProblemData } from '@movemate/contracts';
import { ProblemSourceBadge } from '@/components/problem-source-badge';
import { ReportPhotoStrip } from '@/components/report-photo-strip';
import { Badge } from '@/components/ui/badge';

const PRINT_PHOTO_LIMIT = 3;

export function ReportProblem({ problem, roomLabel }: { problem: ReportProblemData; roomLabel: string }) {
  const description = problem.aiSummary ?? problem.checkText;
  return (
    <li className="flex flex-col gap-3 py-4 break-inside-avoid">
      <div className="flex flex-wrap items-center gap-2">
        <ProblemSourceBadge source={problem.source} />
        {problem.source === 'ai' && problem.resolution === 'custom' && <Badge variant="outline">Your own answer</Badge>}
      </div>
      {description && (
        <p className="max-w-prose text-base">
          {problem.source === 'room_check' && <span className="text-muted-foreground">Check: </span>}
          {description}
        </p>
      )}
      {problem.note && (
        <p className="max-w-prose text-sm">
          <span className="text-muted-foreground">Your note: </span>
          {problem.note}
        </p>
      )}
      <ReportPhotoStrip stage="before" photos={problem.beforePhotos} roomLabel={roomLabel} printLimit={PRINT_PHOTO_LIMIT} />
      <ReportPhotoStrip stage="move_in" photos={problem.moveInPhotos} roomLabel={roomLabel} printLimit={PRINT_PHOTO_LIMIT} />
    </li>
  );
}
