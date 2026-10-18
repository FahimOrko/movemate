import { problemSourceLabels, type ProblemSource } from '@movemate/contracts';
import { Badge } from '@/components/ui/badge';

export function ProblemSourceBadge({ source }: { source: ProblemSource }) {
  return <Badge variant="outline">{problemSourceLabels[source]}</Badge>;
}
