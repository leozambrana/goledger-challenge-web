import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  TvShowBase,
  TvShowEntity,
  TvShowCreatePayload,
  TvShowDeletePayload,
  TvShowReadPayload,
  TvShowSearchPayload,
  TvShowUpdatePayload,
} from '../types';

const isServer = typeof window === 'undefined';
const PROXY_ROUTE = '/api/auth/proxy';

interface ApiResponse<T> {
  result?: T;
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

    // Add Basic Auth if on server
    if (isServer) {
      const user = process.env.API_USERNAME;
      const password = process.env.API_PASSWORD;
      if (user && password) {
        const token = Buffer.from(`${user}:${password}`).toString('base64');
        this.axios.defaults.headers.common['Authorization'] = `Basic ${token}`;
      }
    }

    this.axios.interceptors.request.use((config) => {
      console.debug('[ApiClient] Request', {
        url: config.url,
        method: config.method,
        fullUrl: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      });
      return config;
    });

    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('[ApiClient] Error', {
          message: error.message,
          url: error.config?.url,
          status: error.response?.status,
        });

        return Promise.reject(
          error.response?.data ?? {
            message: 'Service unavailable',
            status: error.response?.status ?? 500,
          },
        );
      },
    );
  }

  private endpointUrl(endpoint: string) {
    if (isServer) {
      return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    }
    // On client, use the proxy route and pass the endpoint as a query param
    return `${PROXY_ROUTE}?endpoint=${encodeURIComponent(endpoint)}`;
  }

  async searchTvShows(): Promise<TvShowEntity[]> {
    const payload: TvShowSearchPayload = {
      query: {
        selector: {
          '@assetType': 'tvShows',
        },
      },
    };

    const response = await this.axios.post<ApiResponse<TvShowEntity[]>>(this.endpointUrl('/api/query/search'), payload);
    return response.data.result || (response.data as unknown as TvShowEntity[]) || [];
  }

  async readTvShow(title: string): Promise<TvShowEntity> {
    const payload: TvShowReadPayload = {
      key: {
        '@assetType': 'tvShows',
        title,
      },
    };

    const response = await this.axios.post<ApiResponse<TvShowEntity>>(this.endpointUrl('/api/query/readAsset'), payload);
    return response.data.result || (response.data as unknown as TvShowEntity);
  }

  async createTvShow(createData: TvShowBase): Promise<TvShowEntity> {
    const payload: TvShowCreatePayload = {
      asset: [
        {
          '@assetType': 'tvShows',
          title: createData.title,
          description: createData.description,
          recommendedAge: createData.recommendedAge,
        },
      ],
    };

    const response = await this.axios.post<TvShowEntity>(this.endpointUrl('/api/invoke/createAsset'), payload);
    return response.data;
  }

  async updateTvShow(updateData: TvShowBase): Promise<TvShowEntity> {
    const payload: TvShowUpdatePayload = {
      update: {
        '@assetType': 'tvShows',
        title: updateData.title,
        description: updateData.description,
        recommendedAge: updateData.recommendedAge,
      },
    };

    const response = await this.axios.post<TvShowEntity>(this.endpointUrl('/api/invoke/updateAsset'), payload);
    return response.data;
  }

  async deleteTvShow(title: string): Promise<{ success: boolean }> {
    const payload: TvShowDeletePayload = {
      key: {
        '@assetType': 'tvShows',
        title,
      },
    };

    const response = await this.axios.post<{ success: boolean }>(this.endpointUrl('/api/invoke/deleteAsset'), payload);
    return response.data;
  }
}

export const apiClient = new ApiClient();
