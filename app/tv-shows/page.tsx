'use client';

import { useTVShows } from '../hooks/use-tv-shows';
import { TvShowCard } from '../components/tv-show-card';
import { Skeleton } from '../components/ui/skeleton';
import { Tv, AlertTriangle, Ghost } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function TvShowsPage() {
  const { data: tvShows, isLoading, isError, error, refetch } = useTVShows();

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Tv className="w-8 h-8 text-primary" />
          TV Shows
        </h1>
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
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {error instanceof Error ? error.message : 'We couldn\'t load the TV shows. Please check your connection and try again.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!tvShows || tvShows.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-secondary p-4 rounded-full mb-6">
          <Ghost className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No TV Shows Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          There are no TV shows in our database yet. Check back later or create a new one!
        </p>
        <Button asChild>
           <a href="/tv-shows/new" className="px-4 py-2">Discover More</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="bg-primary/10 p-2 rounded-lg">
            <Tv className="w-10 h-10 text-primary" />
          </span>
          TV Shows
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Explore our collection of amazing series and find your next binge-watch.
        </p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {tvShows.map((tvShow) => (
          <TvShowCard key={tvShow.title} tvShow={tvShow} />
        ))}
      </div>
    </div>
  );
}
