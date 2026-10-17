import { providerSelectionSchema, settleInGuidanceSchema, type ProviderCategory, type ProviderSelection } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSettleInGuidance() {
  return useQuery({ queryKey: ['guidance', 'providers'], queryFn: () => api.get('/guidance/providers', settleInGuidanceSchema) });
}

const selectionKey = (moveId: string) => ['guidance', 'selection', moveId] as const;

export function useProviderSelection(moveId: string) {
  return useQuery({
    queryKey: selectionKey(moveId),
    queryFn: () => api.get(`/moves/${moveId}/providers/selection`, providerSelectionSchema),
  });
}

type SetSelectionInput = { category: ProviderCategory; providerKey: string | null };

export function useSetProviderSelection(moveId: string) {
  const queryClient = useQueryClient();
  const key = selectionKey(moveId);
  return useMutation({
    mutationFn: ({ category, providerKey }: SetSelectionInput) =>
      api.put(`/moves/${moveId}/providers/selection/${category}`, providerSelectionSchema, { providerKey }),
    onMutate: async ({ category, providerKey }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ProviderSelection>(key);
      if (previous) queryClient.setQueryData<ProviderSelection>(key, { ...previous, [category]: providerKey });
      return { previous };
    },
    onError: (_error, _input, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
