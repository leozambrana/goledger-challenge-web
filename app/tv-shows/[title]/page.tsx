'use client';

import * as React from 'react';
import { useTVShowDetails } from '../../hooks/use-tv-shows';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ChevronLeft, Calendar, Tv, Info, Clapperboard } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ title: string }>;
}

export default function TvShowDetailsPage({ params }: PageProps) {
  const { title: encodedTitle } = React.use(params);
  const title = decodeURIComponent(encodedTitle);
  const { data: tvShow, isLoading, isError } = useTVShowDetails(title);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !tvShow) {
    return (
      <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">TV Show Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The TV show &quot;{title}&quot; could not be found or there was an error loading it.
        </p>
        <Button asChild variant="outline">
          <Link href="/tv-shows">Back to Library</Link>
        </Button>
      </div>
    );
  }

  // Same gradient logic for consistency
  const gradients = [
    'from-blue-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-cyan-500',
    'from-pink-500 to-rose-500',
  ];
  const gradientIndex = tvShow.title.length % gradients.length;
  const gradient = gradients[gradientIndex];
  const Icon = tvShow.title.length % 2 === 0 ? Tv : Clapperboard;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className={`relative h-[40vh] bg-linear-to-br ${gradient} flex items-end overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-20">
           <Icon size={300} />
        </div>
        <div className="container mx-auto px-4 pb-12 relative z-10">
          <Button asChild variant="ghost" className="text-white hover:bg-white/20 mb-8 -ml-2">
            <Link href="/tv-shows" className="flex items-center gap-2">
              <ChevronLeft size={20} />
              Back to Library
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                   TV Series
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                   {tvShow.recommendedAge}+
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                {tvShow.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Card Details */}
            <div className="bg-card border rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Info size={20} className="text-primary" />
                Synopsis
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {tvShow.description}
              </p>
            </div>

            {/* Placeholder for future seasons/episodes */}
            <div className="border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
              <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                 <Calendar className="text-muted-foreground" size={32} />
              </div>
              <h4 className="font-semibold text-lg">Seasons & Episodes</h4>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                We&apos;re currently cataloging the seasons for this show. Stay tuned for updates!
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-md">
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Properties</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                   <span className="text-muted-foreground text-sm">Asset Type</span>
                   <span className="font-medium text-sm">TV Show</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                   <span className="text-muted-foreground text-sm">Recommended Age</span>
                   <span className="font-medium text-sm">{tvShow.recommendedAge} years</span>
                </div>
                {tvShow["@lastUpdated"] && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground text-sm">Last Updated</span>
                    <span className="font-medium text-sm">
                      {new Date(tvShow["@lastUpdated"]).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full h-12 text-md font-bold shadow-lg" size="lg">
              Add to Watchlist
            </Button>
          </aside>
        </div>
      </section>
    </div>
  );
}
