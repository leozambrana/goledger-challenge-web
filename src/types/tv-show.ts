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
  // Legacy or alternative field names from API
  name?: string;
  synopsis?: string;
  yearReleased?: number;
  releaseYear?: number;
}

// --- Seasons ---
export interface SeasonBase {
  number: number;
  year: number;
  tvShow: { "@key": string; "@assetType": "tvShows" } | { "@key": string };
}

export interface SeasonEntity extends SeasonBase {
  "@assetType": "seasons";
  "@key": string;
  // Alternative fields
  seasonNumber?: number;
  yearReleased?: number;
  tvShowId?: string;
}

// --- Episodes ---
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
  // Alternative fields
  number?: number;
  name?: string;
  synopsis?: string;
  dateAired?: string;
  airDate?: string;
  seasonId?: string;
}

// --- Watchlists ---
export interface WatchlistBase {
  title: string;
}

export interface WatchlistEntity extends WatchlistBase {
  "@assetType": "watchlist";
  "@key"?: string;
  "@lastUpdated"?: string;
  tvShows?: Array<{ title: string; "@key"?: string; "@assetType"?: string }>;
}

// --- Payloads ---
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
