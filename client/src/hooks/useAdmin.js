import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    },
    enabled,
  });
}

export function useAdminArtisans(enabled = true) {
  return useQuery({
    queryKey: ['admin-artisans'],
    queryFn: async () => {
      const res = await api.get('/admin/artisans');
      return res.data.data.artisans;
    },
    enabled,
  });
}

export function useAdminDisputes(enabled = true) {
  return useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const res = await api.get('/admin/disputes');
      return res.data.data.disputes;
    },
    enabled,
  });
}

export function useVerifyArtisanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/artisans/${id}/verify`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artisans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['artisans'] });
    },
  });
}

export function useResolveDisputeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, resolution_notes }) =>
      api.put(`/admin/disputes/${id}/resolve`, { status, resolution_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}
