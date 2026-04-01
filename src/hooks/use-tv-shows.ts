import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { TvShowEntity } from '../types';

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
