import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useBookings(enabled = true) {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data.data.bookings;
    },
    enabled,
  });
}

export function useBooking(id, enabled = true) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }) => api.put(`/bookings/${id}/status`, { status, notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['artisan'] });
    },
  });
}

export function useSubmitRatingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, rating, review }) =>
      api.post(`/ratings/${bookingId}`, { rating, review }),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['artisan'] });
    },
  });
}

export function useRaiseDisputeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }) =>
      api.post(`/bookings/${bookingId}/disputes`, { reason }),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
  });
}

export function useDispute(id, enabled = true) {
  return useQuery({
    queryKey: ['dispute', id],
    queryFn: async () => {
      const res = await api.get(`/disputes/${id}`);
      return res.data.data.dispute;
    },
    enabled: !!id && enabled,
  });
}

export function useWithdrawDisputeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.put(`/disputes/${id}/withdraw`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
  });
}
