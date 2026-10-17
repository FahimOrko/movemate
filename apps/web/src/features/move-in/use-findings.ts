import {
  compareResultSchema,
  findingSchema,
  type CreateFinding,
  type ResolveFinding,
  type Room,
} from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

const findingsKey = (moveId: string) => ['findings', moveId] as const;

export function useFindings(moveId: string) {
  return useQuery({
    queryKey: findingsKey(moveId),
    queryFn: () => api.get(`/moves/${moveId}/findings`, z.array(findingSchema)),
  });
}

export function useRunCompare(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rooms?: Room[]) => api.post(`/moves/${moveId}/inspection/compare`, compareResultSchema, rooms ? { rooms } : {}),
    onSuccess: (result) => queryClient.setQueryData(findingsKey(moveId), result.findings),
  });
}

export function useResolveFinding(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ResolveFinding }) => api.patch(`/findings/${id}`, findingSchema, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: findingsKey(moveId) }),
  });
}

export function useAddFinding(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFinding) => api.post(`/moves/${moveId}/findings`, findingSchema, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: findingsKey(moveId) }),
  });
}

export function useDeleteFinding(moveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/findings/${id}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: findingsKey(moveId) }),
  });
}
