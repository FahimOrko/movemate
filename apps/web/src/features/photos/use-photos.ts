import { photoSchema, type PhotoStage, type Room } from '@movemate/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

const photosKey = (moveId: string, stage: PhotoStage) => ['photos', moveId, stage] as const;

export function usePhotos(moveId: string, stage: PhotoStage) {
  return useQuery({
    queryKey: photosKey(moveId, stage),
    queryFn: () => api.get(`/moves/${moveId}/photos?stage=${stage}`, z.array(photoSchema)),
  });
}

export function usePhotoActions(moveId: string, stage: PhotoStage) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: photosKey(moveId, stage) });

  const upload = useMutation({
    mutationFn: ({ file, room }: { file: File; room: Room }) => {
      const form = new FormData();
      form.append('stage', stage);
      form.append('room', room);
      form.append('file', file);
      return api.upload(`/moves/${moveId}/photos`, photoSchema, form);
    },
    onSettled: refresh,
  });
  const relabel = useMutation({
    mutationFn: ({ id, room }: { id: string; room: Room }) => api.patch(`/photos/${id}`, photoSchema, { room }),
    onSettled: refresh,
  });
  const remove = useMutation({ mutationFn: (id: string) => api.delete(`/photos/${id}`), onSettled: refresh });

  return { upload, relabel, remove };
}
