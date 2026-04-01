'use client';

import * as React from 'react';
import { TvShowCard } from '../../components/tv-show-card';
import { Skeleton } from '../../components/ui/skeleton';
import { Tv, AlertTriangle, Ghost, Search, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { apiClient } from '../../services/api-client';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/use-debounce';
import { CreateTvShowModal } from '../../components/create-tv-show-modal';

export default function TvShowsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  
  const { data: tvShows, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['tv-shows', debouncedSearch],
    queryFn: () => debouncedSearch ? apiClient.searchTvShowsByTitle(debouncedSearch) : apiClient.searchTvShows(),
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border shadow overflow-hidden">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="py-24 px-4 flex flex-col items-center justify-center text-center">
          <div className="bg-destructive/10 p-4 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-sm">
            {error instanceof Error ? error.message : 'Não conseguimos carregar as séries. Por favor, tente novamente.'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (!tvShows || tvShows.length === 0) {
      return (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="bg-secondary/50 p-6 rounded-full mb-6">
            <Ghost className="w-16 h-16 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Nenhum resultado encontrado</h2>
          <p className="text-muted-foreground max-w-xs mb-8 text-sm">
            Não encontramos nenhuma série correspondente a &quot;{debouncedSearch}&quot;.
          </p>
          <Button onClick={() => setSearchQuery('')} variant="outline">Limpar Pesquisa</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
        {tvShows.map((tvShow) => (
          <TvShowCard key={tvShow.title} tvShow={tvShow} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-lg">
              <Tv className="w-10 h-10 text-primary" />
            </span>
            Séries de TV
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Explore nossa coleção de séries incríveis e encontre sua próxima maratona.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input 
              placeholder="Pesquisar por título..." 
              className="pl-12 h-13 bg-card/40 backdrop-blur-md border-white/10 focus-visible:ring-primary focus-visible:border-primary/50 shadow-xl rounded-2xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isFetching && searchQuery !== debouncedSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <Button 
            size="icon" 
            onClick={() => setIsModalOpen(true)}
            className="h-13 w-13 shrink-0 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all hover:scale-105 active:scale-95" 
            title="Adicionar Série"
          >
            <PlusCircle size={26} />
          </Button>
        </div>
      </header>

      {renderContent()}

      <CreateTvShowModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
