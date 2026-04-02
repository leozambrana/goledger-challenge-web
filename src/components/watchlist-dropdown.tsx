'use client';

import * as React from 'react';
import { Heart, Plus, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTvShowStore } from '../store/tv-show-store';
import { Button } from './ui/button';

interface WatchlistDropdownProps {
  showTitle: string;
  onClose: () => void;
  className?: string;
}

export function WatchlistDropdown({ showTitle, onClose, className }: WatchlistDropdownProps) {
  const { watchlists, addToWatchlist, removeFromWatchlist, setCreateListModalOpen, fetchWatchlists } = useTvShowStore();
  const [loadingList, setLoadingList] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const handleToggle = async (watchlistTitle: string, isCurrentlyIn: boolean) => {
    setLoadingList(watchlistTitle);
    try {
      if (isCurrentlyIn) {
        await removeFromWatchlist(watchlistTitle, showTitle);
      } else {
        await addToWatchlist(watchlistTitle, showTitle);
      }
    } finally {
      setLoadingList(null);
    }
  };

  return (
    <div className={cn(
      "z-60 w-64 bg-card/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
      className
    )}>
      <header className="px-4 py-3 border-b border-white/5 bg-white/5">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adicionar à lista</h4>
      </header>
      
      <div className="max-h-48 overflow-y-auto py-2">
        {watchlists.length === 0 ? (
          <div className="px-4 py-4 text-center">
            <p className="text-[10px] text-muted-foreground font-medium mb-3">Você não tem listas.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onClose();
                setCreateListModalOpen(true);
              }}
              className="h-8 w-full rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
            >
              <Plus className="mr-1 h-3 w-3" /> Criar Lista
            </Button>
          </div>
        ) : (
          watchlists.map((list) => {
            const isInList = list.tvShows?.some((s) => s.title === showTitle);
            const isPending = loadingList === list.title;
            
            return (
              <button
                key={list["@key"]}
                onClick={() => handleToggle(list.title, !!isInList)}
                disabled={isPending}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-all",
                    isInList ? "bg-rose-500 border-rose-500" : "border-white/20 group-hover:border-white/40"
                  )}>
                    {isPending ? (
                      <Loader2 className="h-2 w-2 animate-spin text-white" />
                    ) : isInList ? (
                      <Check className="h-2.5 w-2.5 text-white stroke-4" />
                    ) : null}
                  </div>
                  <span className="text-xs font-bold truncate max-w-35 tracking-tight">{list.title}</span>
                </div>
                {isInList && <Heart className="h-3 w-3 text-rose-500 fill-current" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
