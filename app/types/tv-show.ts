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
  "@key"?: TvShowKey;
  "@lastUpdated"?: string;
}

export interface TvShowCreatePayload {
  asset: Array<{
    "@assetType": "tvShows";
    title: string;
    description: string;
    recommendedAge: number;
  }>;
}

export interface TvShowUpdatePayload {
  update: {
    "@assetType": "tvShows";
    title: string;
    description: string;
    recommendedAge: number;
  };
}

export interface TvShowDeletePayload {
  key: TvShowKey;
}

export interface TvShowReadPayload {
  key: TvShowKey;
}

export interface TvShowSearchPayload {
  query: {
    selector: {
      "@assetType": "tvShows";
      [key: string]: unknown;
    };
  };
}
