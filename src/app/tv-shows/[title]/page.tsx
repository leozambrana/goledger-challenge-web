'use client';

import * as React from 'react';
import { useTVShowDetails } from '../../../hooks/use-tv-shows';
import { useSeasons, useEpisodes } from '../../../hooks/use-seasons';
import { Skeleton } from '../../../components/ui/skeleton';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { ChevronLeft, Calendar, Tv, Info, Clapperboard, Star, PlayCircle, Layers, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function EpisodeList({ seasonKey }: { seasonKey: string }) {
  const { data: episodes, isLoading, isError } = useEpisodes(seasonKey);

  if (isLoading) return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );

  if (isError || !episodes || episodes.length === 0) return (
    <p className="text-muted-foreground text-center py-6 border border-dashed rounded-xl italic">
      Nenhum episódio indexado para esta temporada ainda.
    </p>
  );

  return (
    <div className="space-y-4 py-4 pr-1">
      {episodes.map((ep) => (
        <div key={ep["@key"]} className="group bg-muted/30 hover:bg-muted/60 border border-border/50 rounded-xl p-4 transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                  EP {ep.episodeNumber}
                </span>
                <h5 className="font-bold text-sm tracking-tight text-foreground/90">{ep.title}</h5>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                {ep.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 px-2.5 py-1 rounded-full text-[10px] font-black ring-1 ring-yellow-500/20">
               <Star size={12} className="fill-yellow-500" />
               {ep.rating}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
             <span className="text-[10px] text-muted-foreground font-bold tracking-tight opacity-70">
                Lançamento: {new Date(ep.releaseDate).toLocaleDateString('pt-BR')}
             </span>
             <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/20 transition-all">
                <PlayCircle size={14} /> Assistir Agora
             </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SeasonsSection({ tvShowKey, showTitle }: { tvShowKey: string, showTitle: string }) {
  const { data: seasons, isLoading, isError } = useSeasons(tvShowKey);

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );

  if (isError || !seasons || seasons.length === 0) return (
    <div className="border border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-muted/20">
      <div className="bg-background p-4 rounded-full shadow-sm mb-4">
        <Calendar className="text-muted-foreground opacity-50" size={32} />
      </div>
      <h4 className="font-bold text-lg">Temporadas não encontradas</h4>
      <p className="text-sm text-muted-foreground max-w-xs mt-2 leading-relaxed">
        Ainda não catalogamos os episódios de &quot;{showTitle}&quot; no blockchain.
      </p>
    </div>
  );

  return (
    <div className="bg-card border rounded-3xl p-8 shadow-2xl ring-1 ring-border/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
          <Layers size={28} className="text-primary" />
          Temporadas e Episódios
        </h3>
        <Badge variant="outline" className="font-mono text-[10px] opacity-60 uppercase">
           {seasons.length} Temporada{seasons.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <Accordion 
        type="single" 
        collapsible 
        className="w-full space-y-4"
        defaultValue={seasons[0]?.["@key"]} // Auto-open first season
      >
        {seasons.map((season) => (
          <AccordionItem 
            key={season["@key"]} 
            value={season["@key"]} 
            className="border rounded-2xl px-6 bg-muted/5 hover:bg-muted/10 transition-all duration-300 data-[state=open]:bg-muted/20 data-[state=open]:border-primary/40 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-6">
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
            <AccordionContent className="border-t border-border/30">
               <EpisodeList seasonKey={season["@key"]} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

interface PageProps {
  params: Promise<{ title: string }>;
}

export default function TvShowDetailsPage({ params }: PageProps) {
  const { title: encodedTitle } = React.use(params);
  const title = decodeURIComponent(encodedTitle);
  const { data: tvShow, isLoading, isError } = useTVShowDetails(title);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-8 animate-pulse text-sm">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[40vh] w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !tvShow) {
    return (
      <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-destructive/10 p-6 rounded-full mb-6">
           <AlertTriangle size={48} className="text-destructive" />
        </div>
        <h2 className="text-3xl font-black mb-4">Recurso não encontrado</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          A série &quot;{title}&quot; não está disponível em nossos registros.
        </p>
        <Button asChild variant="outline" size="lg" className="rounded-full">
          <Link href="/tv-shows">Voltar ao Catálogo</Link>
        </Button>
      </div>
    );
  }

  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-red-600',
    'from-violet-600 to-purple-600',
    'from-rose-600 to-pink-600',
  ];
  const gradientIndex = tvShow.title.length % gradients.length;
  const gradient = gradients[gradientIndex];
  const Icon = tvShow.title.length % 2 === 0 ? Tv : Clapperboard;

  return (
    <div className="min-h-screen pb-24 bg-background/50">
      {/* Dynamic Hero Section */}
      <section className={`relative h-[45vh] bg-linear-to-br ${gradient} flex items-end overflow-hidden shadow-inner`}>
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-110 pointer-events-none">
           <Icon size={400} />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        
        <div className="container mx-auto px-6 pb-12 relative z-10">
          <Button asChild variant="ghost" className="text-white hover:bg-white/20 mb-10 -ml-4 rounded-full transition-all">
            <Link href="/tv-shows" className="flex items-center gap-2 font-black px-4 uppercase tracking-widest text-xs">
              <ChevronLeft size={18} /> Catálogo
            </Link>
          </Button>
          
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                 ENTIDADE BLOCKCHAIN
              </Badge>
              <Badge variant="secondary" className="bg-primary text-primary-foreground border-none shadow-lg px-3 py-1 text-[10px] font-black">
                 CLASSIFICAÇÃO {tvShow.recommendedAge}+
              </Badge>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-4 leading-none">
              {tvShow.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Central Column - Content */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Seasons Archive (MOVED TOP) */}
            <SeasonsSection tvShowKey={tvShow["@key"] || ""} showTitle={tvShow.title} />

            {/* Synopsis Card */}
            <div className="bg-card border rounded-3xl p-8 shadow-xl relative overflow-hidden group ring-1 ring-border/50">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-5 transition-opacity pointer-events-none">
                 <Info size={120} />
              </div>
              <h3 className="text-xl font-black flex items-center gap-3 mb-6 border-b border-border/50 pb-4 tracking-tight">
                <Info size={22} className="text-primary" />
                Sinopse
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {tvShow.description}
              </p>
            </div>
          </div>

          {/* Sidebar - Details */}
          <aside className="space-y-8">
            <div className="bg-card border rounded-3xl p-8 shadow-xl sticky top-24 ring-1 ring-border/50">
              <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-muted-foreground border-b border-border/50 pb-4">Ativos de Produção</h4>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-1.5">
                   <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-60">Classificação</span>
                   <p className="font-bold text-sm tracking-tight text-foreground/90">Ativo TV Hyperledger</p>
                </div>
                <div className="space-y-1.5">
                   <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-60">Recomendação etária</span>
                   <p className="font-bold text-sm tracking-tight text-foreground/90">Mínimo {tvShow.recommendedAge} anos</p>
                </div>
                <div className="space-y-2">
                   <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-60">Identificador em Cadeia</span>
                   <p className="font-mono text-[9px] break-all leading-relaxed bg-muted/60 p-4 rounded-xl border border-dashed border-border/60 text-muted-foreground font-medium">
                      {tvShow["@key"]}
                   </p>
                </div>
                {tvShow["@lastUpdated"] && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-60">Sincronização Blockchain</span>
                    <p className="font-bold text-sm tracking-tight text-foreground/90">
                      {new Date(tvShow["@lastUpdated"]).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-10 space-y-4">
                 <Button className="w-full h-14 text-xs font-black uppercase tracking-widest shadow-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group" size="lg">
                    <Star className="mr-2 group-hover:fill-current" size={16} /> Adicionar à lista
                 </Button>
                 
                 <Button variant="outline" className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-60 hover:opacity-100 hover:text-destructive border-dashed" size="sm">
                    Sinalizar para revisão
                 </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
