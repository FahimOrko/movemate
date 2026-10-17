import { reportSummarySchema } from '@movemate/contracts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSummary(moveId: string) {
  return useQuery({ queryKey: ['summary', moveId], queryFn: () => api.get(`/moves/${moveId}/summary`, reportSummarySchema) });
}
