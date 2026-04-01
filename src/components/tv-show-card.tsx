import Link from 'next/link';
import { Tv, Clapperboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TvShowEntity } from '../types';

interface TvShowCardProps {
  tvShow: TvShowEntity;
}

export function TvShowCard({ tvShow }: TvShowCardProps) {
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
    <Card className="group overflow-hidden flex flex-col h-full bg-card/40 backdrop-blur-xl border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className={`relative h-40 bg-linear-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
        
        <Icon className="w-16 h-16 text-white drop-shadow-2xl opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
        
        <Badge variant="secondary" className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border-white/20 text-white font-mono font-bold px-2 py-0.5">
          {tvShow.recommendedAge}+
        </Badge>
      </div>
      
      <CardHeader className="flex-none p-6 pb-6">
        <CardTitle className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {tvShow.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-3 mb-2 text-sm leading-relaxed text-muted-foreground/80 h-12 group-hover:text-muted-foreground transition-colors">
          {tvShow.description}
        </CardDescription>
      </CardHeader>
      
      <CardFooter className="mt-auto p-6 pt-0">
        <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 rounded-xl transition-all duration-300 group-hover:shadow-primary/40">
          <Link href={`/tv-shows/${encodeURIComponent(tvShow.title)}`} className="flex items-center justify-center gap-2">
            Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
