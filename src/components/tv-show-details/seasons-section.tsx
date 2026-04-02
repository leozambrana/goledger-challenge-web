'use client';

import * as React from 'react';
import { Plus, Layers, Edit3, Trash2, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useSeasons } from '../../hooks/use-seasons';
import { SeasonEntity } from '../../types';
import { CreateSeasonModal, EditSeasonModal, DeleteSeasonDialog } from '../season-modals';
import { EpisodeList } from './episode-list';

interface SeasonsSectionProps {
  tvShowKey: string;
  showTitle: string;
}

export function SeasonsSection({ tvShowKey, showTitle }: SeasonsSectionProps) {
  const { data: seasons, isLoading, isError } = useSeasons(tvShowKey);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editSeason, setEditSeason] = React.useState<SeasonEntity | null>(null);
  const [deleteSeason, setDeleteSeason] = React.useState<SeasonEntity | null>(null);

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );

  if (isError || !seasons || seasons.length === 0) return (
    <>
      <div className="border border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-muted/20">
        <div className="bg-background p-4 rounded-full shadow-sm mb-4">
          <Calendar className="text-muted-foreground opacity-50" size={32} />
        </div>
        <h4 className="font-bold text-lg">Temporadas não encontradas</h4>
        <p className="text-sm text-muted-foreground max-w-xs mt-2 leading-relaxed">
          Ainda não catalogamos os episódios de &quot;{showTitle}&quot; no blockchain.
        </p>
        <Button onClick={() => setCreateModalOpen(true)} className="mt-6 rounded-2xl font-black uppercase tracking-widest text-[10px]">
           <Plus className="mr-2 h-4 w-4" /> Adicionar Temporada
        </Button>
      </div>
      <CreateSeasonModal 
        tvShowKey={tvShowKey} 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />
    </>
  );

  return (
    <div className="bg-card border rounded-3xl p-8 shadow-2xl ring-1 ring-border/50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Layers size={28} className="text-primary" />
          <h3 className="text-2xl font-black tracking-tight">
            Temporadas
          </h3>
          <Badge variant="outline" className="ml-2 font-mono text-[10px] opacity-60 uppercase">
             {seasons.length}
          </Badge>
        </div>
        <Button 
          size="sm" 
          onClick={() => setCreateModalOpen(true)} 
          className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9"
        >
           <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar
        </Button>
      </div>

      <Accordion 
        type="single" 
        collapsible 
        className="w-full space-y-4"
        defaultValue={seasons[0]?.["@key"]}
      >
        {seasons.map((season) => (
          <AccordionItem 
            key={season["@key"]} 
            value={season["@key"]} 
            className="border rounded-2xl px-1 bg-muted/5 hover:bg-muted/10 transition-all duration-300 data-[state=open]:bg-muted/20 data-[state=open]:border-primary/40 overflow-hidden"
          >
            <div className="flex items-center px-4">
              <AccordionTrigger className="flex-1 hover:no-underline py-6">
                <div className="flex items-center gap-5 text-left">
                  <div className="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ring-1 ring-primary/20">
                     {season.number}
                  </div>
                  <div>
                     <h4 className="font-black text-lg leading-none tracking-tight">Temporada {season.number}</h4>
                     <p className="text-[10px] text-muted-foreground mt-1.5 font-black uppercase tracking-widest opacity-60">
                        Ano de Lançamento: {season.year}
                     </p>
                  </div>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setEditSeason(season);
                  }}
                  className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                >
                  <Edit3 size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setDeleteSeason(season);
                  }}
                  className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <AccordionContent className="border-t border-border/30 px-5">
               <EpisodeList seasonKey={season["@key"]} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <CreateSeasonModal 
        tvShowKey={tvShowKey} 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />

      {editSeason && (
        <EditSeasonModal 
          season={editSeason} 
          isOpen={!!editSeason} 
          onClose={() => setEditSeason(null)} 
        />
      )}

      {deleteSeason && (
        <DeleteSeasonDialog 
          season={deleteSeason} 
          tvShowKey={tvShowKey} 
          isOpen={!!deleteSeason} 
          onClose={() => setDeleteSeason(null)} 
        />
      )}
    </div>
  );
}
