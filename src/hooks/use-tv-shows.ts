import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { TvShowEntity, TvShowBase } from '../types';

export function useTVShows() {
  return useQuery<TvShowEntity[]>({
    queryKey: ['tv-shows'],
    queryFn: () => apiClient.searchTvShows(),
  });
}

export function useTVShowDetails(title: string) {
  return useQuery<TvShowEntity>({
    queryKey: ['tv-show', title],
    queryFn: () => apiClient.readTvShow(title),
    enabled: !!title,
  });
}

export function useUpdateTVShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, data }: { title: string; data: Partial<TvShowBase> }) => {
      const key = { title };
      return apiClient.updateAsset('tvShows', key, data);
    },
    onSuccess: (_, { title }) => {
      queryClient.invalidateQueries({ queryKey: ['tv-shows'] });
      queryClient.invalidateQueries({ queryKey: ['tv-show', title] });
    },
  });
}

export function useDeleteTVShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => apiClient.deleteAsset('tvShows', { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-shows'] });
    },
  });
}
