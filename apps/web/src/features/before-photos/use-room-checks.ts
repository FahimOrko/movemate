import {
  baselineResultSchema,
  roomCheckSchema,
  type CreateRoomCheck,
  type Room,
} from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';
import { currentMoveKey } from '@/features/prepare/use-move';

const checksKey = (moveId: string) => ['room-checks', moveId] as const;

export function useRoomChecks(moveId: string) {
  return useQuery({
    queryKey: checksKey(moveId),
    queryFn: () => api.get(`/moves/${moveId}/room-checks`, z.array(roomCheckSchema)),
  });
}

export function useRunBaseline(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rooms?: Room[]) => api.post(`/moves/${moveId}/inspection/baseline`, baselineResultSchema, rooms ? { rooms } : {}),
    onSuccess: (result) => queryClient.setQueryData(checksKey(moveId), result.checks),
    // A fully successful run unlocks the next phase on the server.
    onSettled: () => queryClient.invalidateQueries({ queryKey: currentMoveKey }),
  });
}

export function useAddRoomCheck(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoomCheck) => api.post(`/moves/${moveId}/room-checks`, roomCheckSchema, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: checksKey(moveId) }),
  });
}

export function useDeleteRoomCheck(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/room-checks/${id}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: checksKey(moveId) }),
  });
}
