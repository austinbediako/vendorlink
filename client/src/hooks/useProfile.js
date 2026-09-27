import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile');
      return res.data.data.profile;
    },
    enabled,
  });
}

export function useProfileCompleteness(enabled = true) {
  return useQuery({
    queryKey: ['profile-completeness'],
    queryFn: async () => {
      const res = await api.get('/profile/completeness');
      return res.data.data.isComplete;
    },
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile) => api.put('/profile', profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-completeness'] });
    },
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blob) =>
      api.post('/profile/photo', blob, {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-completeness'] });
      queryClient.invalidateQueries({ queryKey: ['artisan'] });
    },
  });
}
