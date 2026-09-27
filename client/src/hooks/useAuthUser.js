import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useAuthUser(enabled = true) {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data.user;
    },
    enabled,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => api.post('/auth/login', { email, password }),
    onSuccess: (res) => {
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['auth-user'], user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return user;
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, role }) =>
      api.post('/auth/register', { email, password, role }),
    onSuccess: (res) => {
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['auth-user'], user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return user;
    },
  });
}
