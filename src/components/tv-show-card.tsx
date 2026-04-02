import Link from 'next/link';
import * as React from 'react';
import { Tv, Clapperboard, Heart, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TvShowEntity } from '../types';
import { useTvShowStore } from '../store/tv-show-store';
import { cn } from '@/lib/utils';
import { WatchlistDropdown } from './watchlist-dropdown';
import { EditTvShowModal } from './edit-tv-show-modal';
import { DeleteTvShowDialog } from './delete-tv-show-dialog';

interface TvShowCardProps {
  tvShow: TvShowEntity;
}

export function TvShowCard({ tvShow }: TvShowCardProps) {
  const { isFavoriteInAnyList } = useTvShowStore();
  const isFav = isFavoriteInAnyList(tvShow.title);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Generate a sophisticated gradient based on the title
  const gradients = [
    'from-indigo-500/80 via-blue-500/80 to-cyan-400/80',
    'from-violet-500/80 via-purple-500/80 to-fuchsia-400/80',
    'from-emerald-500/80 via-teal-500/80 to-cyan-400/80',
    'from-rose-500/80 via-pink-500/80 to-purple-400/80',
    'from-amber-500/80 via-orange-500/80 to-red-400/80',
  ];
  
  const gradientIndex = tvShow.title.length % gradients.length;
  const gradient = gradients[gradientIndex];
  
  const Icon = tvShow.title.length % 2 === 0 ? Tv : Clapperboard;

  return (
    <Card className="group relative flex flex-col h-full bg-card/40 backdrop-blur-xl border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-0 hover:z-10">
      <div className="flex flex-col h-full overflow-hidden rounded-[inherit]">
        <div className={`relative h-40 bg-linear-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
          
          <Icon className="w-16 h-16 text-white drop-shadow-2xl opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
          
          <Badge variant="secondary" className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border-white/20 text-white font-mono font-bold px-2 py-0.5">
            {tvShow.recommendedAge}+
          </Badge>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={cn(
              "absolute top-3 left-3 h-8 w-8 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 z-50",
              isFav 
                ? "bg-rose-500 text-white border-rose-500/50 shadow-lg shadow-rose-500/30" 
                : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
            )}
          >
            {isMenuOpen ? <MoreVertical className="h-4 w-4" /> : <Heart className={cn("h-4 w-4 transition-transform", isFav && "fill-current animate-pulse-slow scale-110")} />}
          </Button>
        </div>
        
        <CardHeader className="flex-none p-6 pb-6">
          <CardTitle className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {tvShow.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-3 mb-2 text-sm leading-relaxed text-muted-foreground/80 h-12 group-hover:text-muted-foreground transition-colors font-medium">
            {tvShow.description}
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="mt-auto p-6 pt-0 flex gap-2">
          <Button asChild className="flex-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 rounded-xl transition-all duration-300 group-hover:shadow-primary/40">
            <Link href={`/tv-shows/${encodeURIComponent(tvShow.title)}`} className="flex items-center justify-center gap-2">
              Detalhes
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsEditOpen(true)}
            className="h-11 w-11 rounded-xl border-white/10 hover:bg-white/5 transition-all duration-300"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsDeleteOpen(true)}
            className="h-11 w-11 rounded-xl border-white/10 text-destructive hover:bg-destructive/10 transition-all duration-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </div>

      {isMenuOpen && (
        <div className="absolute top-12 left-3 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px]" onClick={() => setIsMenuOpen(false)} />
          <WatchlistDropdown showTitle={tvShow.title} onClose={() => setIsMenuOpen(false)} className="absolute top-0 left-0" />
        </div>
      )}

      <EditTvShowModal 
        tvShow={tvShow} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
      
      <DeleteTvShowDialog 
        title={tvShow.title} 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
      />
    </Card>
  );
}
