import { guidanceProgressSchema, prepareGuidanceSchema, type GuidanceProgress } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

export function usePrepareGuidance() {
  return useQuery({ queryKey: ['guidance', 'prepare'], queryFn: () => api.get('/guidance/prepare', prepareGuidanceSchema) });
}

const progressKey = (moveId: string) => ['guidance', 'progress', moveId] as const;

export function useProgress(moveId: string) {
  return useQuery({
    queryKey: progressKey(moveId),
    queryFn: () => api.get(`/moves/${moveId}/guidance`, z.array(guidanceProgressSchema)),
  });
}

type SetProgressInput = { itemKey: string; completed: boolean };

export function useSetProgress(moveId: string) {
  const queryClient = useQueryClient();
  const key = progressKey(moveId);
  return useMutation({
    mutationFn: ({ itemKey, completed }: SetProgressInput) =>
      api.patch(`/moves/${moveId}/guidance/${itemKey}`, guidanceProgressSchema, { completed }),
    onMutate: async ({ itemKey, completed }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<GuidanceProgress[]>(key);
      const others = (previous ?? []).filter((entry) => entry.itemKey !== itemKey);
      queryClient.setQueryData<GuidanceProgress[]>(key, [...others, { itemKey, completed }]);
      return { previous };
    },
    onError: (_error, _input, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
