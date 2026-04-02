'use client';

import * as React from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { useDeleteTVShow } from '../hooks/use-tv-shows';
import { createPortal } from 'react-dom';

interface DeleteTvShowDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteTvShowDialog({ title, isOpen, onClose }: DeleteTvShowDialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mutation = useDeleteTVShow();

  const handleDelete = () => {
    mutation.mutate(title, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 text-sm">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-destructive/20 shadow-2xl rounded-3xl p-8 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-destructive/10 blur-[80px] -z-10" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="bg-destructive/10 p-5 rounded-2xl ring-1 ring-destructive/20">
            <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">Excluir Série?</h2>
            <p className="text-muted-foreground font-medium text-xs leading-relaxed max-w-70">
              Você está prestes a remover <span className="text-destructive font-black underline underline-offset-4 decoration-2">&quot;{title}&quot;</span> permanentemente do registro blockchain.
            </p>
            <div className="mt-4 p-3 bg-destructive/5 border border-destructive/10 rounded-xl">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/70">Aviso: Esta ação é irreversível.</p>
            </div>
          </div>

          <div className="flex w-full gap-3 pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted/50 transition-all">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={mutation.isPending}
              className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {mutation.isPending ? (
                 <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Agora
                </>
              )}
            </Button>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
           <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
}
