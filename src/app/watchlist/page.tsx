'use client';

import * as React from 'react';
import { useTvShowStore } from '../../store/tv-show-store';
import { Heart, ArrowRight, Tv, PlusCircle, Plus, Edit3, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CreateWatchlistModal } from '../../components/create-watchlist-modal';
import { WatchlistEntity } from '../../types';

import { Badge } from '../../components/ui/badge';
import { EditWatchlistModal, DeleteWatchlistDialog } from '../../components/watchlist-actions-modals';
import { AddShowToWatchlistModal } from '../../components/add-show-to-watchlist-modal';

export default function WatchlistPage() {
  const { watchlists, fetchWatchlists, setCreateListModalOpen, removeFromWatchlist } = useTvShowStore();
  const [removingShow, setRemovingShow] = React.useState<{ list: string, show: string } | null>(null);
  
  // Modals state
  const [selectedList, setSelectedList] = React.useState<WatchlistEntity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [addingToShowList, setAddingToShowList] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const openEdit = (list: WatchlistEntity) => {
    setSelectedList(list);
    setIsEditModalOpen(true);
  };

  const openDelete = (list: WatchlistEntity) => {
    setSelectedList(list);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto py-12 px-6 min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-500/20 p-2 rounded-xl">
               <Heart className="w-8 h-8 text-rose-500 fill-current animate-pulse-slow" />
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic text-rose-500">Minhas Listas</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Gerencie suas coleções de séries. Crie listas personalizadas e salve no blockchain.
          </p>
        </div>
        
        <Button 
          onClick={() => setCreateListModalOpen(true)}
          className="h-14 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 gap-3"
        >
          <PlusCircle size={20} /> Nova Lista
        </Button>
      </header>

      {watchlists.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-card/20 rounded-3xl border border-dashed border-white/10 backdrop-blur-sm shadow-inner">
          <div className="bg-muted/50 p-8 rounded-full mb-8 text-rose-500/40">
            <Tv className="w-16 h-16 text-rose-500/30 opacity-30" />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight">Crie sua primeira lista</h2>
          <p className="text-muted-foreground max-w-xs mb-10 text-lg font-medium">
            Para salvar séries como favoritas, você precisa primeiro criar uma lista.
          </p>
          <Button onClick={() => setCreateListModalOpen(true)} size="lg" className="h-14 px-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest shadow-xl shadow-rose-500/20">
            Começar <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {watchlists.map((list: WatchlistEntity) => (
            <div key={list["@key"]} className="group relative bg-card/40 backdrop-blur-xl border border-white/10 hover:border-rose-500/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-rose-500/5 cursor-pointer overflow-hidden flex flex-col h-full ring-inset ring-white/5 ring-1">
               {/* Aesthetic Background Gradient */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-colors" />
               
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="bg-rose-500/10 text-rose-500 p-3 rounded-2xl">
                     <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                        onClick={(e) => { e.stopPropagation(); openEdit(list); }}
                     >
                        <Edit3 size={14} />
                     </Button>
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        onClick={(e) => { e.stopPropagation(); openDelete(list); }}
                     >
                        <Trash2 size={14} />
                     </Button>
                  </div>
               </div>
               
               <h3 className="text-2xl font-black tracking-tight line-clamp-1 relative z-10">{list.title}</h3>
               <p className="text-muted-foreground mt-2 text-xs font-medium opacity-60 relative z-10 mb-8 font-mono truncate">
                 ID: {list["@key"]}
               </p>
               
               <div className="mt-auto relative z-10">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 opacity-50">Séries Salvas</h4>
                 <div className="flex flex-wrap gap-2">
                    {list.tvShows && list.tvShows.length > 0 ? (
                      list.tvShows.map((show, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="bg-white/5 hover:bg-white/20 text-white/90 border-white/10 pl-3.5 pr-1.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors group/badge h-9 max-w-full"
                        >
                          <span className="truncate max-w-35 inline-block">{show.title}</span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setRemovingShow({ list: list.title, show: show.title });
                              await removeFromWatchlist(list.title, show.title);
                              setRemovingShow(null);
                            }}
                            disabled={removingShow?.list === list.title && removingShow?.show === show.title}
                            className="ml-3 p-1.5 hover:bg-rose-500 hover:text-white rounded-lg transition-colors bg-white/5 border border-white/10 group-hover/badge:border-rose-500/50"
                          >
                             {removingShow?.list === list.title && removingShow?.show === show.title ? (
                               <Loader2 size={12} className="animate-spin" />
                             ) : (
                               <X size={12} />
                             )}
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-[10px] italic text-muted-foreground opacity-40">Nenhuma série nesta lista.</p>
                    )}
                    <Badge 
                       variant="outline" 
                       className="bg-primary/5 hover:bg-primary/20 text-primary border-primary/20 hover:border-primary/50 px-3.5 py-1.5 h-9 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 group/add"
                       onClick={() => setAddingToShowList(list.title)}
                     >
                        <Plus size={14} className="mr-2 group-hover/add:rotate-90 transition-transform duration-300" />
                        Adicionar
                     </Badge>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      <CreateWatchlistModal />
      
      <AddShowToWatchlistModal 
        watchlistTitle={addingToShowList || ''} 
        isOpen={!!addingToShowList} 
        onClose={() => setAddingToShowList(null)} 
      />
      
      {selectedList && (
        <>
          <EditWatchlistModal 
            isOpen={isEditModalOpen} 
            onClose={() => { setIsEditModalOpen(false); setSelectedList(null); }} 
            oldTitle={selectedList.title} 
          />
          <DeleteWatchlistDialog 
            isOpen={isDeleteModalOpen} 
            onClose={() => { setIsDeleteModalOpen(false); setSelectedList(null); }} 
            title={selectedList.title} 
          />
        </>
      )}
    </div>
  );
}
