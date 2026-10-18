import { roomLabels, roomSchema, type Photo, type ReportSummary } from '@movemate/contracts';
import { Link } from 'react-router';
import { SummarySection } from '@/components/summary-section';
import { roomSectionId } from '@/lib/room-section-id';

type SummaryProblemsProps = {
  problems: ReportSummary['problems'];
  /** One thumbnail per problem, in the same order; undefined when the problem has no photo. */
  thumbnails: (Photo | undefined)[];
  reportHref: string;
};

export function SummaryProblems({ problems, thumbnails, reportHref }: SummaryProblemsProps) {
  return (
    <SummarySection id="problems-title" title="Problems found">
      {problems.length === 0 ? (
        <p className="text-muted-foreground">No problems recorded.</p>
      ) : (
        roomSchema.options.map((room) => {
          const inRoom = problems.flatMap((problem, index) => (problem.room === room ? [{ problem, thumbnail: thumbnails[index] }] : []));
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
                {inRoom.map(({ problem, thumbnail }, index) => (
                  <li key={`${problem.text}-${index}`} className="flex items-center gap-3 py-2 text-sm">
                    {thumbnail ? (
                      <img src={thumbnail.url} alt="" loading="lazy" className="aspect-4/3 w-16 shrink-0 rounded-md border object-cover" />
                    ) : (
                      <span aria-hidden="true" className="aspect-4/3 w-16 shrink-0 rounded-md border bg-muted" />
                    )}
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
    </SummarySection>
  );
}
