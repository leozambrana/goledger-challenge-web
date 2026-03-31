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
  // Generate a pseudo-random gradient based on the title
  const gradients = [
    'from-blue-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-cyan-500',
    'from-pink-500 to-rose-500',
  ];
  
  const gradientIndex = tvShow.title.length % gradients.length;
  const gradient = gradients[gradientIndex];
  
  // Choose an icon based on title
  const Icon = tvShow.title.length % 2 === 0 ? Tv : Clapperboard;

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg">
      <div className={`h-32 bg-linear-to-br ${gradient} flex items-center justify-center`}>
        <Icon className="w-12 h-12 text-white opacity-80" />
      </div>
      
      <CardHeader className="flex-none">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl line-clamp-1">{tvShow.title}</CardTitle>
          <Badge variant="secondary" className="font-mono">
            {tvShow.recommendedAge}+
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 mt-2 h-10">
          {tvShow.description}
        </CardDescription>
      </CardHeader>
      
      <CardFooter className="mt-auto pt-2">
        <Button asChild className="w-full">
          <Link href={`/tv-shows/${encodeURIComponent(tvShow.title)}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
