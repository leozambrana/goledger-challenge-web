'use client';

import * as React from 'react';
import { ChevronLeft, Info, Tv, Clapperboard, Heart, AlertTriangle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useTVShowDetails } from '../../../hooks/use-tv-shows';
import { Skeleton } from '../../../components/ui/skeleton';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useTvShowStore } from '../../../store/tv-show-store';
import { cn } from '@/lib/utils';
import { WatchlistDropdown } from '../../../components/watchlist-dropdown';
import { SeasonsSection } from '../../../components/tv-show-details/seasons-section';

interface PageProps {
  params: Promise<{ title: string }>;
}

export default function TvShowDetailsPage({ params }: PageProps) {
  const { title: encodedTitle } = React.use(params);
  const title = decodeURIComponent(encodedTitle);
  const { setCurrentTvShow, isFavoriteInAnyList, watchlists, removeFromWatchlist, fetchWatchlists } = useTvShowStore();
  const [removingFrom, setRemovingFrom] = React.useState<string | null>(null);
  const [activeMenu, setActiveMenu] = React.useState<'header' | 'sidebar' | null>(null);

  React.useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const { data: tvShow, isLoading, isError } = useTVShowDetails(title);

  React.useEffect(() => {
    if (tvShow) {
      setCurrentTvShow(tvShow);
    }
    return () => setCurrentTvShow(null);
  }, [tvShow, setCurrentTvShow]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-8 animate-pulse text-sm text-balance">
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
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Recurso não encontrado</h2>
        <p className="text-muted-foreground mb-8 text-lg font-medium">
          A série &quot;{title}&quot; não está disponível em nossos registros.
        </p>
        <Button asChild variant="outline" size="lg" className="rounded-full font-black uppercase tracking-widest text-[10px]">
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
  const isFav = isFavoriteInAnyList(tvShow.title);

  const inWatchlists = watchlists.filter((l) => 
    l.tvShows?.some((s) => s.title === tvShow.title)
  );

  return (
    <div className="min-h-screen pb-24 bg-background/50">
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
          
          <div className="max-w-4xl flex items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary" className="bg-primary text-primary-foreground border-none shadow-lg px-3 py-1 text-[10px] font-black">
                   CLASSIFICAÇÃO {tvShow.recommendedAge}+
                </Badge>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-4 leading-none text-balance">
                {tvShow.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <SeasonsSection tvShowKey={tvShow["@key"] || ""} showTitle={tvShow.title} />

            <div className="bg-card border rounded-3xl p-8 shadow-xl relative overflow-hidden group ring-1 ring-border/50">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-5 transition-opacity pointer-events-none">
                 <Info size={120} />
              </div>
              <h3 className="text-xl font-black flex items-center gap-3 mb-6 border-b border-border/50 pb-4 tracking-tight uppercase">
                <Info size={22} className="text-primary" />
                Sinopse do Asset
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {tvShow.description}
              </p>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-card border rounded-3xl p-8 shadow-xl sticky top-24 ring-1 ring-border/50">
              <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-muted-foreground border-b border-border/50 pb-4">Informações extras</h4>
                <div className="space-y-1.5">
                   <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-60">Restrição de Consumo</span>
                   <p className="font-bold text-sm tracking-tight text-foreground/90">{tvShow.recommendedAge}+ Anos Recomendados</p>
              </div>
              
              {inWatchlists.length > 0 && (
                <div className="mt-8 space-y-3">
                   <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-60">Vínculos de Favoritos</span>
                   <div className="flex flex-wrap gap-2">
                      {inWatchlists.map(list => (
                        <Badge 
                         key={list["@key"]} 
                         variant="secondary" 
                         className="pl-4 pr-1.5 py-1.5 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 text-xs font-black uppercase tracking-wider rounded-xl transition-all group/badge max-w-full"
                        >
                          <span className="truncate max-w-35 inline-block">{list.title}</span>
                          <button
                            onClick={async () => {
                              setRemovingFrom(list.title);
                              await removeFromWatchlist(list.title, tvShow.title);
                              setRemovingFrom(null);
                            }}
                            disabled={removingFrom === list.title}
                            className="ml-3 p-1.5 hover:bg-rose-500 hover:text-white rounded-lg transition-colors bg-rose-500/10 border border-rose-500/20 group-hover/badge:border-rose-500/50"
                          >
                            {removingFrom === list.title ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                          </button>
                        </Badge>
                      ))}
                   </div>
                </div>
              )}
              
              <div className="mt-10 space-y-4 relative">
                 <Button 
                   onClick={() => setActiveMenu(activeMenu === 'sidebar' ? null : 'sidebar')}
                   className={cn(
                     "w-full h-14 text-xs font-black uppercase tracking-widest shadow-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group relative",
                     isFav ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "shadow-primary/20"
                   )} 
                   size="lg"
                 >
                    <Heart className={cn("mr-2 h-4 w-4", isFav && "fill-current")} />
                    {isFav ? 'Gerenciar a Listas' : 'Favoritar em uma Lista'}
                 </Button>

                 {activeMenu === 'sidebar' && (
                  <div className="absolute bottom-full right-0 mb-4 z-100">
                    <div className="fixed inset-0 bg-black/5" onClick={() => setActiveMenu(null)} />
                    <WatchlistDropdown showTitle={tvShow.title} onClose={() => setActiveMenu(null)} className="relative z-110" />
                  </div>
                 )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
