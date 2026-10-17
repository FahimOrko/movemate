import { guidanceProgressSchema, type ChecklistStatus, type GuidanceProgress, type ProviderSelection } from '@movemate/contracts';
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
  const selectionKey = ['guidance', 'selection', moveId] as const;
  return useMutation({
    mutationFn: ({ itemKey, status }: SetStatusInput) =>
      api.patch(`/moves/${moveId}/guidance/${itemKey}`, guidanceProgressSchema, { status }),
    onMutate: async ({ itemKey, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      await queryClient.cancelQueries({ queryKey: selectionKey });
      const previous = queryClient.getQueryData<GuidanceProgress[]>(key);
      const previousSelection = queryClient.getQueryData<ProviderSelection>(selectionKey);
      queryClient.setQueryData<GuidanceProgress[]>(key, previous?.map((entry) => (entry.key === itemKey ? { ...entry, status } : entry)));
      // N/A on a linked item clears that category's provider on the server.
      const category = previous?.find((entry) => entry.key === itemKey)?.linkedCategory;
      if (status === 'na' && category && previousSelection) queryClient.setQueryData<ProviderSelection>(selectionKey, { ...previousSelection, [category]: null });
      return { previous, previousSelection };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(key, context?.previous);
      queryClient.setQueryData(selectionKey, context?.previousSelection);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: selectionKey }),
        queryClient.invalidateQueries({ queryKey: ['summary', moveId] }),
      ]),
  });
}
