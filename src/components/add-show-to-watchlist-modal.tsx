'use client';

import * as React from 'react';
import { Plus, Search, Tv, Loader2, X } from 'lucide-react';
import { useTvShowStore } from '../store/tv-show-store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { createPortal } from 'react-dom';

interface AddShowToWatchlistModalProps {
  watchlistTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddShowToWatchlistModal({ watchlistTitle, isOpen, onClose }: AddShowToWatchlistModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAdding, setIsAdding] = React.useState<string | null>(null);

  const { tvShows, watchlists, addToWatchlist } = useTvShowStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const currentWatchlist = watchlists.find(l => l.title === watchlistTitle);
  const alreadyAddedTitles = currentWatchlist?.tvShows?.map(s => s.title) || [];

  const availableShows = tvShows.filter(show => 
    !alreadyAddedTitles.includes(show.title) &&
    show.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (showTitle: string) => {
    setIsAdding(showTitle);
    try {
      await addToWatchlist(watchlistTitle, showTitle);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="bg-primary/20 p-2 rounded-xl">
                  <Plus className="w-5 h-5 text-primary" />
               </div>
               <h2 className="text-xl font-bold tracking-tight">Adicionar Série</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
              <X size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground font-medium mb-6">
            Escolha uma série para adicionar à lista <span className="text-primary font-black">&quot;{watchlistTitle.toUpperCase()}&quot;</span>.
          </p>

          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Pesquisar série..." 
              className="pl-10 h-11 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </header>

        <div className="max-h-87.5 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {availableShows.length > 0 ? (
            availableShows.map((show) => (
              <div 
                key={show.title}
                className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                onClick={() => handleAdd(show.title)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Tv className="w-5 h-5 text-primary opacity-70 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold truncate max-w-50">{show.title}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-tighter">
                      {show.recommendedAge}+ anos
                    </p>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground"
                  disabled={isAdding === show.title}
                >
                  {isAdding === show.title ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground font-medium opacity-50">
                {searchTerm ? 'Nenhuma série encontrada.' : 'Todas as séries já estão nesta lista!'}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5 mt-2">
           <Button variant="ghost" onClick={onClose} className="w-full text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100">
             Fechar
           </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
