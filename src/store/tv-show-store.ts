import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TvShowEntity, WatchlistEntity } from '../types';
import { apiClient } from '../services/api-client';

interface TvShowStore {
  // Data
  tvShows: TvShowEntity[];
  watchlists: WatchlistEntity[];
  currentTvShow: TvShowEntity | null;
  
  // UI / Filters
  searchQuery: string;
  isCreateModalOpen: boolean;
  isCreateListModalOpen: boolean;
  
  // Actions
  setTvShows: (shows: TvShowEntity[]) => void;
  setCurrentTvShow: (show: TvShowEntity | null) => void;
  setSearchQuery: (query: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setCreateListModalOpen: (isOpen: boolean) => void;
  
  // Watchlist Actions
  fetchWatchlists: () => Promise<void>;
  createWatchlist: (title: string) => Promise<void>;
  updateWatchlistTitle: (oldTitle: string, newTitle: string) => Promise<void>;
  deleteWatchlist: (title: string) => Promise<void>;
  addToWatchlist: (watchlistTitle: string, showTitle: string) => Promise<void>;
  removeFromWatchlist: (watchlistTitle: string, showTitle: string) => Promise<void>;
  isFavoriteInAnyList: (showTitle: string) => boolean;
}

export const useTvShowStore = create<TvShowStore>()(
  persist(
    (set, get) => ({
      tvShows: [],
      watchlists: [],
      currentTvShow: null,
      searchQuery: '',
      isCreateModalOpen: false,
      isCreateListModalOpen: false,

      setTvShows: (shows) => set({ tvShows: shows }),
      setCurrentTvShow: (show) => set({ currentTvShow: show }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setCreateListModalOpen: (isOpen) => set({ isCreateListModalOpen: isOpen }),

      fetchWatchlists: async () => {
        try {
          const [lists, allShows] = await Promise.all([
            apiClient.searchWatchlists(),
            apiClient.searchTvShows()
          ]);
          
          const enrichedWatchlists = lists.map(list => {
            if (!list.tvShows) return list;
            
            const enrichedShows = list.tvShows.map(showRef => {
              const fullShow = allShows.find(s => {
                if (showRef["@key"] && s["@key"] === showRef["@key"]) return true;
                if (showRef.title && s.title) {
                  return showRef.title.toLowerCase().trim() === s.title.toLowerCase().trim();
                }
                return false;
              });
              
              return fullShow 
                ? { title: fullShow.title, "@key": fullShow["@key"] } 
                : showRef;
            });
            
            return {
              ...list,
              tvShows: enrichedShows
            };
          });

          set((state) => ({ 
            watchlists: enrichedWatchlists, 
            tvShows: state.searchQuery.trim() === '' ? allShows : state.tvShows 
          }));
        } catch (error) {
          console.error("Failed to fetch watchlists:", error);
        }
      },

      createWatchlist: async (title: string) => {
        try {
          await apiClient.createWatchlist(title);
          await get().fetchWatchlists();
        } catch (error) {
          console.error("Failed to create watchlist:", error);
          throw error;
        }
      },

      updateWatchlistTitle: async (oldTitle: string, newTitle: string) => {
        try {
          const { watchlists } = get();
          const list = watchlists.find(l => l.title === oldTitle);
          if (!list || !list["@key"]) return;

          const key = { 
            "@assetType": "watchlist", 
            "@key": list["@key"] 
          };
          
          const update = { 
            "@key": list["@key"],
            "@assetType": "watchlist",
            "title": newTitle 
          };

          await apiClient.updateAsset('watchlist', key, update);
          await get().fetchWatchlists();
        } catch (error) {
          console.error("Failed to update watchlist title:", error);
          throw error;
        }
      },

      deleteWatchlist: async (title: string) => {
        try {
          const { watchlists } = get();
          const list = watchlists.find(l => l.title === title);
          if (!list || !list["@key"]) return;

          await apiClient.deleteAsset('watchlist', { "@key": list["@key"] });
          await get().fetchWatchlists();
        } catch (error) {
          console.error("Failed to delete watchlist:", error);
          throw error;
        }
      },

      addToWatchlist: async (watchlistTitle: string, showTitle: string) => {
        try {
          const { watchlists, tvShows } = get();
          const list = watchlists.find(l => l.title === watchlistTitle);
          const show = tvShows.find(s => s.title.toLowerCase().trim() === showTitle.toLowerCase().trim());
          if (!list || !show || !list["@key"] || !show["@key"]) return;

          const currentShowIds = list.tvShows?.map(s => s["@key"]).filter(Boolean) as string[] || [];
          if (currentShowIds.includes(show["@key"])) return;

          const newShowIds = [...currentShowIds, show["@key"]];
          await apiClient.updateWatchlist(list["@key"], newShowIds);
          await get().fetchWatchlists();
        } catch (error) {
          console.error("Failed to add to watchlist:", error);
        }
      },

      removeFromWatchlist: async (watchlistTitle: string, showTitle: string) => {
        try {
          const { watchlists } = get();
          const list = watchlists.find(l => l.title === watchlistTitle);
          if (!list || !list["@key"]) return;

          const currentShowIds = list.tvShows?.map(s => s["@key"]).filter(Boolean) as string[] || [];
          
          const showToRemove = list.tvShows?.find(s => 
            s.title?.toLowerCase().trim() === showTitle.toLowerCase().trim()
          );
          if (!showToRemove || !showToRemove["@key"]) return;

          const newShowIds = currentShowIds.filter(id => id !== showToRemove["@key"]);
          
          await apiClient.updateWatchlist(list["@key"], newShowIds);
          await get().fetchWatchlists();
        } catch (error) {
          console.error("Failed to remove from watchlist:", error);
        }
      },

      isFavoriteInAnyList: (showTitle: string) => {
        const { watchlists } = get();
        return watchlists.some(l => 
          l.tvShows?.some(s => s.title === showTitle)
        );
      }
    }),
    {
      name: 'goledger-tv-storage',
      partialize: (state) => ({ 
        searchQuery: state.searchQuery,
      }),
    }
  )
);
