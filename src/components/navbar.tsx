'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tv, Heart, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTvShowStore } from '../store/tv-show-store';

export function Navbar() {
  const pathname = usePathname();
  const { watchlists } = useTvShowStore();
  
  const navItems = [
    { 
      name: 'Explorar', 
      href: '/tv-shows', 
      icon: LayoutDashboard,
      active: pathname === '/tv-shows'
    },
    { 
      name: 'Meus Favoritos', 
      href: '/watchlist', 
      icon: Heart,
      active: pathname === '/watchlist',
      badge: (watchlists?.length || 0) > 0 ? (watchlists?.length || 0) : null
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-2xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/tv-shows" className="flex items-center gap-3 group">
          <div className="bg-primary/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Tv className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">GoLedger TV</span>
        </Link>

        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                item.active 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon size={16} className={cn(item.active && "animate-pulse-slow")} />
              {item.name}
              
              {item.badge && !item.active && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-black shadow-lg">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
