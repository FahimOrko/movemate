import type { CreateMove, Move } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const currentMoveKey = ['move', 'current'] as const;

export function useCurrentMove() {
  return useQuery({ queryKey: currentMoveKey, queryFn: () => api.get<Move | null>('/moves/current') });
}

export function useCreateMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMove) => api.post<Move>('/moves', input),
    onSuccess: (move) => queryClient.setQueryData(currentMoveKey, move),
  });
}

export function useAdvanceMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moveId: string) => api.post<Move>(`/moves/${moveId}/advance`),
    onSuccess: (move) => queryClient.setQueryData(currentMoveKey, move),
  });
}
