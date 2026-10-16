import { moveSchema, type CreateMove } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const currentMoveKey = ['move', 'current'] as const;

export function useCurrentMove() {
  return useQuery({ queryKey: currentMoveKey, queryFn: () => api.get('/moves/current', moveSchema.nullable()) });
}

export function useCreateMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMove) => api.post('/moves', moveSchema, input),
    onSuccess: (move) => queryClient.setQueryData(currentMoveKey, move),
  });
}

export function useAdvanceMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moveId: string) => api.post(`/moves/${moveId}/advance`, moveSchema),
    onSuccess: (move) => queryClient.setQueryData(currentMoveKey, move),
  });
}
