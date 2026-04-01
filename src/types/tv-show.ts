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
}

// --- Seasons ---
export interface SeasonBase {
  number: number;
  year: number;
  tvShow: { "@key": string };
}

export interface SeasonEntity extends SeasonBase {
  "@assetType": "seasons";
  "@key": string;
}

// --- Episodes ---
export interface EpisodeBase {
  episodeNumber: number;
  title: string;
  description: string;
  rating: number;
  releaseDate: string;
  season: { "@key": string };
}

export interface EpisodeEntity extends EpisodeBase {
  "@assetType": "episodes";
  "@key": string;
}

// --- Payloads ---
export interface TvShowCreatePayload {
  asset: Array<Record<string, unknown>>;
}

export interface TvShowUpdatePayload {
  update: Record<string, unknown>;
}

export interface TvShowDeletePayload {
  key: {
    "@assetType": string;
    [key: string]: unknown;
  };
}

export interface TvShowReadPayload {
  key: {
    "@assetType": string;
    [key: string]: unknown;
  };
}

export interface TvShowSearchPayload {
  query: {
    selector: {
      "@assetType": string;
      [key: string]: unknown;
    };
  };
}
