import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useArtisans(filters = {}) {
  const { category, location, minRating } = filters;

  return useQuery({
    queryKey: ['artisans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (category) params.append('category', category);
      if (minRating) params.append('minRating', minRating);
      const res = await api.get(`/artisans?${params.toString()}`);
      return res.data.data.artisans;
    },
  });
}

export function useArtisan(uid, viewerId) {
  return useQuery({
    queryKey: ['artisan', uid, viewerId || 'guest'],
    queryFn: async () => {
      const res = await api.get(`/artisans/${uid}`);
      return res.data.data;
    },
    enabled: !!uid,
  });
}
