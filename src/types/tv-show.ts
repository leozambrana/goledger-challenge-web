export interface AssetKey {
  "@assetType"?: string;
  [key: string]: unknown;
}

export interface TvShowBase {
  title: string;
  description: string;
  recommendedAge: number;
}

export interface TvShowKey {
  "@assetType": "tvShows";
  title: string;
}

export interface TvShowEntity extends TvShowBase {
  "@assetType": "tvShows";
  "@key"?: string;
  "@lastUpdated"?: string;
  name?: string;
  synopsis?: string;
  yearReleased?: number;
  releaseYear?: number;
}

export interface SeasonBase {
  number: number;
  year: number;
  tvShow: { "@key": string; "@assetType": "tvShows" } | { "@key": string };
}

export interface SeasonEntity extends SeasonBase {
  "@assetType": "seasons";
  "@key": string;
  seasonNumber?: number;
  yearReleased?: number;
  tvShowId?: string;
}

export interface EpisodeBase {
  episodeNumber: number;
  title: string;
  description: string;
  rating: number;
  releaseDate: string;
  season: { "@key": string; "@assetType": "seasons" } | { "@key": string };
}

export interface EpisodeEntity extends EpisodeBase {
  "@assetType": "episodes";
  "@key": string;
  number?: number;
  name?: string;
  synopsis?: string;
  dateAired?: string;
  airDate?: string;
  seasonId?: string;
}

export interface WatchlistBase {
  title: string;
}

export interface WatchlistEntity extends WatchlistBase {
  "@assetType": "watchlist";
  "@key"?: string;
  "@lastUpdated"?: string;
  tvShows?: Array<{ title: string; "@key"?: string; "@assetType"?: string }>;
}

export interface ApiPostPayload {
  asset?: unknown[];
  update?: Record<string, unknown>;
  key?: AssetKey;
  query?: {
    selector: Record<string, unknown>;
  };
}

export interface ApiResponse<T> {
  result?: T;
  docs?: T[];
  items?: T[];
  data?: T | T[];
}
