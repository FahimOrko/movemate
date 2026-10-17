import { guidanceProgressSchema, type ChecklistStatus, type GuidanceProgress } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

const checklistKey = (moveId: string) => ['guidance', 'progress', moveId] as const;

export function useChecklist(moveId: string) {
  return useQuery({
    queryKey: checklistKey(moveId),
    queryFn: () => api.get(`/moves/${moveId}/guidance`, z.array(guidanceProgressSchema)),
  });
}

type SetStatusInput = { itemKey: string; status: ChecklistStatus };

export function useSetChecklistStatus(moveId: string) {
  const queryClient = useQueryClient();
  const key = checklistKey(moveId);
  return useMutation({
    mutationFn: ({ itemKey, status }: SetStatusInput) =>
      api.patch(`/moves/${moveId}/guidance/${itemKey}`, guidanceProgressSchema, { status }),
    onMutate: async ({ itemKey, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<GuidanceProgress[]>(key);
      queryClient.setQueryData<GuidanceProgress[]>(key, previous?.map((entry) => (entry.key === itemKey ? { ...entry, status } : entry)));
      return { previous };
    },
    onError: (_error, _input, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () =>
      Promise.all([queryClient.invalidateQueries({ queryKey: key }), queryClient.invalidateQueries({ queryKey: ['summary', moveId] })]),
  });
}
