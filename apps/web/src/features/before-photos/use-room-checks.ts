import {
  baselineResultSchema,
  roomCheckSchema,
  type AnswerRoomCheck,
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

export function useAnswerRoomCheck(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AnswerRoomCheck }) => api.patch(`/room-checks/${id}`, roomCheckSchema, body),
    // A problem is stored as a finding, so both lists change.
    onSettled: () => Promise.all([queryClient.invalidateQueries({ queryKey: checksKey(moveId) }), queryClient.invalidateQueries({ queryKey: ['findings', moveId] })]),
  });
}
