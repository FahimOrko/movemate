import { reportSchema } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { currentMoveKey } from '@/features/prepare/use-move';
import { ApiError, api } from '@/lib/api';

const latestReportKey = (moveId: string) => ['report', moveId, 'latest'] as const;

export function useLatestReport(moveId: string) {
  return useQuery({
    queryKey: latestReportKey(moveId),
    queryFn: () =>
      api.get(`/moves/${moveId}/reports/latest`, reportSchema).catch((error: unknown) => {
        if (error instanceof ApiError && error.code === 'not_found') return null;
        throw error;
      }),
  });
}

export function useGenerateReport(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/moves/${moveId}/reports`, reportSchema),
    onSuccess: (report) => {
      queryClient.setQueryData(latestReportKey(moveId), report);
      return queryClient.invalidateQueries({ queryKey: currentMoveKey });
    },
  });
}
