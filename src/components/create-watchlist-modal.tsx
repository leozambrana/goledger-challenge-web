'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, PlusCircle, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTvShowStore } from '../store/tv-show-store';

const formSchema = z.object({
  title: z.string().min(2, "O título da lista deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateWatchlistModal() {
  const { isCreateListModalOpen: isOpen, setCreateListModalOpen: onClose, createWatchlist } = useTvShowStore();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    setError(null);
    try {
      await createWatchlist(data.title);
      reset();
      onClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar lista.");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => onClose(false)}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-rose-500/20 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-rose-500 fill-current" />
             </div>
             <h2 className="text-2xl font-black tracking-tight italic uppercase">Criar Nova Lista</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onClose(false)} className="rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </Button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2.5">
            <label htmlFor="title" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Nome da Lista</label>
            <Input 
               id="title" 
               placeholder="Ex: Maratonar no Fim de Semana" 
               {...register('title')} 
               className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.title && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.title.message}</span>}
          </div>

          <div className="pt-6 flex gap-3">
             <Button type="button" variant="outline" onClick={() => onClose(false)} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                Cancelar
             </Button>
             <Button type="submit" disabled={isPending} className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Lista
                  </>
                )}
             </Button>
          </div>
          
          {error && (
             <p className="text-[10px] font-black text-destructive uppercase tracking-wide text-center">
                {error}
             </p>
          )}
        </form>
      </div>
    </div>
  );
}
