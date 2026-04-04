import axios, { AxiosInstance } from 'axios';
import {
  TvShowEntity,
  TvShowBase,
  SeasonEntity,
  EpisodeEntity,
  WatchlistEntity,
  ApiResponse,
  ApiPostPayload,
  AssetKey,
} from '../types';

const isServer = typeof window === 'undefined';
const PROXY_ROUTE = '/api/auth/proxy';

const MVCC_RETRY_LIMIT = 2;
const MVCC_RETRY_DELAY_MS = 350;

export class ApiClient {
  private axios: AxiosInstance;

  constructor() {
    const baseURL = isServer ? process.env.NEXT_PUBLIC_API_BASE_URL : '';
    
    this.axios = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (isServer) {
      const auth = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
      this.axios.defaults.headers.common['Authorization'] = `Basic ${auth}`;
    }
  }

  private endpointUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (isServer) return normalizedPath;
    return `${PROXY_ROUTE}?endpoint=${encodeURIComponent(normalizedPath)}`;
  }

  private async apiPost<T>(endpoint: string, body: ApiPostPayload): Promise<T> {
    for (let attempt = 0; attempt <= MVCC_RETRY_LIMIT; attempt += 1) {
      try {
        const response = await this.axios.post<T>(this.endpointUrl(endpoint), body);
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message || '';
          const isMvccConflict = error.response?.status && error.response.status >= 500 && message.includes('MVCC_READ_CONFLICT');

          if (isMvccConflict && attempt < MVCC_RETRY_LIMIT) {
            await new Promise((resolve) => 
              setTimeout(resolve, MVCC_RETRY_DELAY_MS * (attempt + 1))
            );
            continue;
          }
        }
        throw error;
      }
    }
    throw new Error('API Error: unexpected failure after retries.');
  }

  private normalizeAssetRecord<T>(input: unknown): T {
    if (!input || typeof input !== 'object') return input as T;
    
    const item = { ...input } as Record<string, unknown>;
    const assetType = item['@assetType'];

    if (assetType === 'tvShows') {
      return {
        ...item,
        title: (item.title as string) ?? (item.name as string),
        description: (item.description as string) ?? (item.synopsis as string),
        yearReleased: (item.yearReleased as number) ?? (item.releaseYear as number),
      } as unknown as T;
    }

    if (assetType === 'seasons') {
      const tvShow = item.tvShow as Record<string, unknown>;
      return {
        ...item,
        number: (item.number as number) ?? (item.seasonNumber as number),
        seasonNumber: (item.seasonNumber as number) ?? (item.number as number),
        year: (item.year as number) ?? (item.yearReleased as number),
        tvShow: tvShow ?? (item.tvShowId ? { '@assetType': 'tvShows', '@key': item.tvShowId } : undefined),
      } as unknown as T;
    }

    if (assetType === 'episodes') {
      const season = item.season as Record<string, unknown>;
      return {
        ...item,
        title: (item.title as string) ?? (item.name as string),
        name: (item.name as string) ?? (item.title as string),
        episodeNumber: (item.episodeNumber as number) ?? (item.number as number),
        description: (item.description as string) ?? (item.synopsis as string),
        releaseDate: (item.releaseDate as string) ?? (item.dateAired as string) ?? (item.airDate as string),
        season: season ?? (item.seasonId ? { '@assetType': 'seasons', '@key': item.seasonId } : undefined),
      } as unknown as T;
    }

    return item as T;
  }

  private normalizeSearchResult<T>(response: ApiResponse<T[]>): T[] {
    const rawData = response.result || response.docs || response.items || (response.data as T[]) || [];
    const collection = Array.isArray(rawData) ? rawData : [rawData];
    return collection.map(item => this.normalizeAssetRecord<T>(item));
  }

  private serializeAssetForWrite(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(i => this.serializeAssetForWrite(i));
    if (!input || typeof input !== 'object') return input;

    const item = { ...input } as Record<string, unknown>;
    return item;
  }

  // --- Public Methods ---

  async searchAssets<T>(assetType: string): Promise<T[]> {
    const payload: ApiPostPayload = {
      query: { selector: { '@assetType': assetType } },
    };
    const data = await this.apiPost<ApiResponse<T[]>>('/query/search', payload);
    return this.normalizeSearchResult<T>(data);
  }

  async searchTvShows(): Promise<TvShowEntity[]> {
    return this.searchAssets<TvShowEntity>('tvShows');
  }

  async searchTvShowsByTitle(query: string): Promise<TvShowEntity[]> {
    const payload: ApiPostPayload = {
      query: {
        selector: {
          '@assetType': 'tvShows',
          'title': { '$regex': `(?i)${query}` },
        },
      },
    };
    const data = await this.apiPost<ApiResponse<TvShowEntity[]>>('/query/search', payload);
    return this.normalizeSearchResult<TvShowEntity>(data);
  }

  async searchSeasons(tvShowKey: string): Promise<SeasonEntity[]> {
    const allSeasons = await this.searchAssets<SeasonEntity>('seasons');
    return allSeasons.filter(s => s.tvShow?.['@key'] === tvShowKey);
  }

  async searchEpisodes(seasonKey: string): Promise<EpisodeEntity[]> {
    const allEpisodes = await this.searchAssets<EpisodeEntity>('episodes');
    return allEpisodes.filter(e => e.season?.['@key'] === seasonKey);
  }

  async readTvShow(title: string): Promise<TvShowEntity> {
    const payload: ApiPostPayload = { key: { '@assetType': 'tvShows', title } };
    const data = await this.apiPost<ApiResponse<TvShowEntity>>('/query/readAsset', payload);
    return this.normalizeAssetRecord<TvShowEntity>(data.result || data);
  }

  async createTvShow(asset: TvShowBase): Promise<TvShowEntity> {
    const payload: ApiPostPayload = { asset: this.serializeAssetForWrite([ { ...asset, '@assetType': 'tvShows' } ]) as unknown[] };
    return this.apiPost<TvShowEntity>('/invoke/createAsset', payload);
  }

  async searchWatchlists(): Promise<WatchlistEntity[]> {
    const payload: ApiPostPayload = {
      query: { selector: { '@assetType': 'watchlist' } },
    };
    const data = await this.apiPost<ApiResponse<WatchlistEntity[]>>('/query/search', payload);
    return this.normalizeSearchResult<WatchlistEntity>(data);
  }

  async createWatchlist(title: string): Promise<WatchlistEntity> {
    const payload: ApiPostPayload = {
      asset: [
        {
          "@assetType": "watchlist",
          "title": title,
          "name": title
        }
      ]
    };
    return this.apiPost<WatchlistEntity>('/invoke/createAsset', payload);
  }

  async updateWatchlist(watchlistKey: string, tvShowIds: string[]): Promise<WatchlistEntity> {
    const payload: ApiPostPayload = {
      update: { 
        "@assetType": "watchlist",
        "@key": watchlistKey,
        "tvShows": tvShowIds.map(id => ({
          "@assetType": "tvShows",
          "@key": id
        }))
      }
    };
    return this.apiPost<WatchlistEntity>('/invoke/updateAsset', payload);
  }

  async updateAsset(assetType: string, key: AssetKey, update: Record<string, unknown>): Promise<unknown> {
    const payload: ApiPostPayload = { 
      update: { ...key, ...update, "@assetType": assetType } 
    };
    return this.apiPost<unknown>('/invoke/updateAsset', payload);
  }

  async createSeason(tvShowKey: string, number: number, year: number): Promise<SeasonEntity> {
    const payload: ApiPostPayload = {
      asset: [
        {
          "@assetType": "seasons",
          "tvShow": {
            "@assetType": "tvShows",
            "@key": tvShowKey
          },
          "year": year,
          "number": number
        }
      ]
    };
    return this.apiPost<SeasonEntity>('/invoke/createAsset', payload);
  }

  async updateSeason(seasonKey: string, number: number, year: number): Promise<SeasonEntity> {
    const payload: ApiPostPayload = {
      key: { "@assetType": "seasons", "@key": seasonKey },
      update: { 
        "@assetType": "seasons",
        "@key": seasonKey,
        "number": number,
        "year": year
      }
    };
    return this.apiPost<SeasonEntity>('/invoke/updateAsset', payload);
  }

  async createEpisode(seasonKey: string, number: number, title: string, description: string, releaseDate: string, rating: number): Promise<EpisodeEntity> {
    const payload: ApiPostPayload = {
      asset: [
        {
          "@assetType": "episodes",
          "season": {
            "@assetType": "seasons",
            "@key": seasonKey
          },
          "episodeNumber": number,
          "title": title,
          "description": description,
          "releaseDate": releaseDate,
          "rating": rating
        }
      ]
    };
    return this.apiPost<EpisodeEntity>('/invoke/createAsset', payload);
  }

  async updateEpisode(episodeKey: string, seasonKey: string, number: number, title: string, description: string, releaseDate: string, rating: number): Promise<EpisodeEntity> {
    const payload: ApiPostPayload = {
      key: { "@assetType": "episodes", "@key": episodeKey },
      update: { 
        "@assetType": "episodes",
        "@key": episodeKey,
        "season": { "@assetType": "seasons", "@key": seasonKey },
        "episodeNumber": number,
        "title": title,
        "description": description,
        "releaseDate": releaseDate,
        "rating": rating
      }
    };
    return this.apiPost<EpisodeEntity>('/invoke/updateAsset', payload);
  }

  async deleteAsset(assetType: string, identification: Record<string, unknown>): Promise<unknown> {
    const payload: ApiPostPayload = { key: { ...identification, '@assetType': assetType } };
    return this.apiPost<unknown>('/invoke/deleteAsset', payload);
  }
}

export const apiClient = new ApiClient();
