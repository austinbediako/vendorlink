import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useServiceRequests(enabled = true) {
  return useQuery({
    queryKey: ['service-requests'],
    queryFn: async () => {
      const res = await api.get('/service-requests');
      return res.data.data.requests;
    },
    enabled,
  });
}

export function useMyApplications(enabled = true) {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/service-requests/my-applications');
      return res.data.data.applications;
    },
    enabled,
  });
}

export function useServiceRequest(id, enabled = true) {
  return useQuery({
    queryKey: ['service-request', id],
    queryFn: async () => {
      const res = await api.get(`/service-requests/${id}`);
      return res.data.data.request;
    },
    enabled: !!id,
  });
}

export function useServiceRequestApplications(id) {
  return useQuery({
    queryKey: ['service-request-applications', id],
    queryFn: async () => {
      const res = await api.get(`/service-requests/${id}/applications`);
      return res.data.data.applications;
    },
    enabled: !!id,
  });
}

export function useCreateServiceRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/service-requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
    },
  });
}

export function useApplyToRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }) => api.post(`/service-requests/${id}/apply`, { message }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['service-request', id] });
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
    },
  });
}

export function useApproveApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, applicationId }) =>
      api.put(`/service-requests/${requestId}/applications/${applicationId}/approve`),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['service-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['service-request-applications', requestId] });
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const res = await api.get('/service-requests/categories');
      return res.data.data.categories;
    },
  });
}
