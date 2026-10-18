import { roomLabels, roomSchema, type ReportSummary } from '@movemate/contracts';
import { Link } from 'react-router';
import { ProblemSourceBadge } from '@/components/problem-source-badge';
import { roomSectionId } from '@/lib/room-section-id';

type SummaryProblemsProps = { problems: ReportSummary['problems']; reportHref: string };

export function SummaryProblems({ problems, reportHref }: SummaryProblemsProps) {
  return (
    <section aria-labelledby="problems-title" className="flex flex-col gap-3">
      <h2 id="problems-title" className="text-heading">
        Problems found
      </h2>
      {problems.length === 0 ? (
        <p className="text-muted-foreground">No problems recorded</p>
      ) : (
        roomSchema.options.map((room) => {
          const inRoom = problems.filter((problem) => problem.room === room);
          if (inRoom.length === 0) return null;
          return (
            <div key={room} className="break-inside-avoid">
              <h3 className="font-medium">
                <Link
                  to={`${reportHref}#${roomSectionId(room)}`}
                  className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 print:no-underline"
                >
                  {roomLabels[room]}
                </Link>
              </h3>
              <ul className="divide-y">
                {inRoom.map((problem, index) => (
                  <li key={`${problem.text}-${index}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                    <ProblemSourceBadge source={problem.source} />
                    <span className="min-w-0 flex-1">{problem.text}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {problem.photoCount} {problem.photoCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
