import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';

export function useReset() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => api.postEmpty('/reset'),
    onSuccess: () => {
      queryClient.clear();
      void navigate('/');
    },
  });
}
