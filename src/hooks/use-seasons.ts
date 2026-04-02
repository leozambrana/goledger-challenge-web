import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useCreateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tvShowKey, number, year }: { tvShowKey: string, number: number, year: number }) => 
      apiClient.createSeason(tvShowKey, number, year),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seasons', variables.tvShowKey] });
    },
  });
}

export function useUpdateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonKey, number, year }: { seasonKey: string, number: number, year: number }) => 
      apiClient.updateSeason(seasonKey, number, year),
    onSuccess: (updatedSeason) => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      queryClient.invalidateQueries({ queryKey: ['seasons', updatedSeason.tvShow?.['@key']] });
    },
  });
}

export function useDeleteSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonKey }: { seasonKey: string, tvShowKey: string }) => 
      apiClient.deleteAsset('seasons', { "@key": seasonKey }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seasons', variables.tvShowKey] });
    },
  });
}

export function useCreateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonKey, number, title, description, releaseDate, rating }: { seasonKey: string, number: number, title: string, description: string, releaseDate: string, rating: number }) => 
      apiClient.createEpisode(seasonKey, number, title, description, releaseDate, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['episodes', variables.seasonKey] });
    },
  });
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ episodeKey, seasonKey, number, title, description, releaseDate, rating }: { episodeKey: string, seasonKey: string, number: number, title: string, description: string, releaseDate: string, rating: number }) => 
      apiClient.updateEpisode(episodeKey, seasonKey, number, title, description, releaseDate, rating),
    onSuccess: (updatedEpisode) => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
      queryClient.invalidateQueries({ queryKey: ['episodes', updatedEpisode.season?.['@key']] });
    },
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ episodeKey }: { episodeKey: string, seasonKey: string }) => 
      apiClient.deleteAsset('episodes', { "@key": episodeKey }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['episodes', variables.seasonKey] });
    },
  });
}
