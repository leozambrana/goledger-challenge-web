'use client';

import * as React from 'react';
import { Plus, Star, Edit3, Trash2, Calendar, PlayCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useEpisodes } from '../../hooks/use-seasons';
import { CreateEpisodeModal, EditEpisodeModal, DeleteEpisodeDialog } from '../episode-modals';
import { EpisodeEntity } from '../../types';

export function EpisodeList({ seasonKey }: { seasonKey: string }) {
  const { data: episodes, isLoading, isError } = useEpisodes(seasonKey);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editEpisode, setEditEpisode] = React.useState<EpisodeEntity | null>(null);
  const [deleteEpisode, setDeleteEpisode] = React.useState<EpisodeEntity | null>(null);

  if (isLoading) return (
    <div className="space-y-3 py-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );

  const renderNoEpisodes = () => (
    <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed rounded-3xl bg-muted/10 space-y-4">
      <p className="text-muted-foreground text-sm font-medium italic">
        Nenhum episódio indexado nesta temporada.
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setCreateModalOpen(true)}
        className="rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary/10 border-primary/20 text-primary"
      >
         <Plus className="mr-1.5 h-3 w-3" /> Adicionar Primeiro Episódio
      </Button>
    </div>
  );

  if (isError || !episodes || episodes.length === 0) return (
    <>
      {renderNoEpisodes()}
      <CreateEpisodeModal 
        seasonKey={seasonKey} 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />
    </>
  );

  return (
    <div className="space-y-4 py-6 pr-1">
      <div className="flex items-center justify-between mb-4 px-1">
         <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Episódios Registrados</h6>
         <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCreateModalOpen(true)}
            className="h-7 rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-primary/20 text-primary"
          >
            <Plus className="mr-1 h-2.5 w-2.5" /> Novo Episódio
          </Button>
      </div>

      <div className="max-h-500px overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/30 scrollbar-track-transparent rounded-xl">
        <div className="grid grid-cols-1 gap-4 pb-2">
          {episodes.map((ep) => (
            <div key={ep["@key"]} className="group bg-muted/20 hover:bg-muted/40 border border-border/50 rounded-2xl p-5 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                      E{ep.episodeNumber}
                    </span>
                    <h5 className="font-bold text-sm tracking-tight text-foreground/90">{ep.title}</h5>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium mb-4">
                    {ep.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-black ring-1 ring-yellow-500/20 shadow-sm">
                    <Star size={12} className="fill-yellow-500" />
                    {ep.rating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditEpisode(ep)}
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                     >
                       <Edit3 size={14} />
                     </Button>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDeleteEpisode(ep)}
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                     >
                       <Trash2 size={14} />
                     </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-1">
                 <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold tracking-tight uppercase opacity-70">
                      <Calendar size={10} /> {new Date(ep.releaseDate).toLocaleDateString('pt-BR')}
                   </div>
                 </div>
                 <Button variant="ghost" size="sm" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all">
                    <PlayCircle size={14} /> Assistir
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateEpisodeModal 
        seasonKey={seasonKey} 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />

      {editEpisode && (
        <EditEpisodeModal 
          episode={editEpisode} 
          isOpen={!!editEpisode} 
          onClose={() => setEditEpisode(null)} 
        />
      )}

      {deleteEpisode && (
        <DeleteEpisodeDialog 
          episode={deleteEpisode} 
          seasonKey={seasonKey} 
          isOpen={!!deleteEpisode} 
          onClose={() => setDeleteEpisode(null)} 
        />
      )}
    </div>
  );
}
