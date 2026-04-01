import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { SeasonEntity, EpisodeEntity } from '../types';

export function useSeasons(tvShowKey: string) {
  return useQuery<SeasonEntity[]>({
    queryKey: ['seasons', tvShowKey],
    queryFn: () => apiClient.searchSeasons(tvShowKey),
    enabled: !!tvShowKey,
  });
}

export function useEpisodes(seasonKey: string) {
  return useQuery<EpisodeEntity[]>({
    queryKey: ['episodes', seasonKey],
    queryFn: () => apiClient.searchEpisodes(seasonKey),
    enabled: !!seasonKey,
  });
}
