import type { Finding, ResolveFinding } from '@movemate/contracts';
import { FindingRow } from '@/components/finding-row';
import { Skeleton } from '@/components/ui/skeleton';

type FindingsTabProps = {
  findings: Finding[];
  comparing?: boolean;
  hasBeforePhotos: boolean;
  onResolve: (finding: Finding, body: ResolveFinding) => Promise<unknown>;
  disabled?: boolean;
};

export function FindingsTab({ findings, comparing, hasBeforePhotos, onResolve, disabled }: FindingsTabProps) {
  if (comparing) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }
  if (findings.length === 0) {
    return (
      <p className="max-w-prose text-sm text-muted-foreground">
        {hasBeforePhotos ? 'No findings yet. Use Compare photos on the Move-in screen to look for differences.' : 'This room has no before photos, so there is nothing to compare.'}
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {findings.map((finding) => (
        <FindingRow key={finding.id} finding={finding} disabled={disabled} onResolve={(body) => onResolve(finding, body)} onDelete={() => undefined} />
      ))}
    </ul>
  );
}
