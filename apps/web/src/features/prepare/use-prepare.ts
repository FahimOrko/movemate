import { prepareGuidanceSchema } from '@movemate/contracts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePrepareGuidance() {
  return useQuery({ queryKey: ['guidance', 'prepare'], queryFn: () => api.get('/guidance/prepare', prepareGuidanceSchema) });
}
