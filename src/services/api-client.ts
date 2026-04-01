import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  TvShowEntity,
  SeasonEntity,
  EpisodeEntity,
} from '../types';

const isServer = typeof window === 'undefined';
const PROXY_ROUTE = '/api/auth/proxy';

// Matches the friend's robust patterns
const MVCC_RETRY_LIMIT = 2;
const MVCC_RETRY_DELAY_MS = 350;

interface ApiResponse<T> {
  result?: T;
  docs?: T;
  items?: T;
  data?: T;
}

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

    // Add interceptor for logging/debugging like the friend's project if needed
  }

  private endpointUrl(path: string): string {
    if (isServer) return path;
    return `${PROXY_ROUTE}?endpoint=${encodeURIComponent(path)}`;
  }

  private async apiPost<T>(endpoint: string, body: unknown): Promise<T> {
    for (let attempt = 0; attempt <= MVCC_RETRY_LIMIT; attempt += 1) {
      try {
        const response = await this.axios.post<T>(this.endpointUrl(endpoint), body);
        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || '';
        const isMvccConflict = error.response?.status >= 500 && message.includes('MVCC_READ_CONFLICT');

        if (isMvccConflict && attempt < MVCC_RETRY_LIMIT) {
          await new Promise((resolve) => 
            setTimeout(resolve, MVCC_RETRY_DELAY_MS * (attempt + 1))
          );
          continue;
        }
        throw error;
      }
    }
    throw new Error('API Error: unexpected failure after retries.');
  }

  private normalizeAssetRecord(input: unknown): any {
    if (!input || typeof input !== 'object') return input;
    
    const item = { ...(input as Record<string, any>) };
    const assetType = item['@assetType'];

    if (assetType === 'tvShows') {
      return {
        ...item,
        title: item.title ?? item.name,
        name: item.name ?? item.title,
        description: item.description ?? item.synopsis,
        yearReleased: item.yearReleased ?? item.releaseYear,
      };
    }

    if (assetType === 'seasons') {
      return {
        ...item,
        number: item.number ?? item.seasonNumber,
        seasonNumber: item.seasonNumber ?? item.number,
        year: item.year ?? item.yearReleased,
        tvShow: item.tvShow ?? (item.tvShowId ? { '@assetType': 'tvShows', '@key': item.tvShowId } : undefined),
      };
    }

    if (assetType === 'episodes') {
      return {
        ...item,
        title: item.title ?? item.name,
        name: item.name ?? item.title,
        episodeNumber: item.episodeNumber ?? item.number,
        description: item.description ?? item.synopsis,
        releaseDate: item.releaseDate ?? item.dateAired ?? item.airDate,
        season: item.season ?? (item.seasonId ? { '@assetType': 'seasons', '@key': item.seasonId } : undefined),
      };
    }

    return item;
  }

  private normalizeSearchResult<T>(response: Record<string, any>): T[] {
    const rawData = response.result || response.docs || response.items || response.data || [];
    const collection = Array.isArray(rawData) ? rawData : [rawData];
    return collection.map(item => this.normalizeAssetRecord(item));
  }

  private serializeAssetForWrite(input: any): any {
    if (Array.isArray(input)) return input.map(i => this.serializeAssetForWrite(i));
    if (!input || typeof input !== 'object') return input;

    const item = { ...input };
    const assetType = item['@assetType'];

    if (assetType === 'tvShows') {
      if (item.title && !item.name) item.name = item.title;
      if (item.yearReleased && !item.releaseYear) item.releaseYear = item.yearReleased;
    }

    if (assetType === 'seasons') {
      if (item.number && !item.seasonNumber) item.seasonNumber = item.number;
      if (item.year && !item.yearReleased) item.yearReleased = item.year;
      
      // Handle relation for write
      if (!item.tvShowId && item.tvShow && typeof item.tvShow === 'object') {
        item.tvShowId = (item.tvShow as any)['@key'];
      }
    }

    if (assetType === 'episodes') {
      if (item.title && !item.name) item.name = item.title;
      if (item.episodeNumber && !item.number) item.number = item.episodeNumber;
      if (item.releaseDate && !item.dateAired) item.dateAired = item.releaseDate;
      
      // Relation
      if (!item.seasonId && item.season && typeof item.season === 'object') {
        item.seasonId = (item.season as any)['@key'];
      }

      if (item.releaseDate) {
        // Ensure RFC3339
        if (typeof item.releaseDate === 'string' && !item.releaseDate.includes('T')) {
          item.releaseDate = `${item.releaseDate}T00:00:00Z`;
        }
      }
    }

    return item;
  }

  // --- Public Methods ---

  async searchAssets<T>(assetType: string): Promise<T[]> {
    const payload = {
      query: { selector: { '@assetType': assetType } },
    };
    const data = await this.apiPost<any>('/api/query/search', payload);
    return this.normalizeSearchResult<T>(data);
  }

  async searchTvShows(): Promise<TvShowEntity[]> {
    return this.searchAssets<TvShowEntity>('tvShows');
  }

  async searchTvShowsByTitle(query: string): Promise<TvShowEntity[]> {
    const payload = {
      query: {
        selector: {
          '@assetType': 'tvShows',
          'title': { '$regex': `(?i)${query}` },
        },
      },
    };
    const data = await this.apiPost<any>('/api/query/search', payload);
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
    const payload = { key: { '@assetType': 'tvShows', title } };
    const data = await this.apiPost<ApiResponse<TvShowEntity>>('/api/query/readAsset', payload);
    return this.normalizeAssetRecord(data.result || data);
  }

  async createTvShow(asset: any): Promise<any> {
    const payload = { asset: this.serializeAssetForWrite([ { ...asset, '@assetType': 'tvShows' } ]) };
    return this.apiPost('/api/invoke/createAsset', payload);
  }

  async updateTvShow(asset: any): Promise<any> {
    const serialized = this.serializeAssetForWrite({ ...asset, '@assetType': 'tvShows' });
    const payload = {
      key: { '@assetType': 'tvShows', title: serialized.title },
      update: serialized
    };
    return this.apiPost('/api/invoke/updateAsset', payload);
  }

  async deleteAsset(assetType: string, key: Record<string, any>): Promise<any> {
    const payload = { key: { ...key, '@assetType': assetType } };
    return this.apiPost('/api/invoke/deleteAsset', payload);
  }
}

export const apiClient = new ApiClient();
