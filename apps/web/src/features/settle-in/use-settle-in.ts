import { settleInGuidanceSchema } from '@movemate/contracts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSettleInGuidance() {
  return useQuery({ queryKey: ['guidance', 'providers'], queryFn: () => api.get('/guidance/providers', settleInGuidanceSchema) });
}
