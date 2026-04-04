'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, PlusCircle, Trash2, Edit3, AlertTriangle, Calendar, Star, Type, AlignLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useCreateEpisode, useUpdateEpisode, useDeleteEpisode } from '../hooks/use-seasons';
import { EpisodeEntity } from '../types';
import { createPortal } from 'react-dom';

const episodeSchema = z.object({
  episodeNumber: z.number().min(1, "O número deve ser pelo menos 1"),
  title: z.string().min(2, "Título muito curto"),
  description: z.string().min(5, "Descrição muito curta"),
  releaseDate: z.string().min(1, "Data obrigatória"),
  rating: z.number().min(0, "Mínimo 0").max(10, "Máximo 10"),
});

type EpisodeFormValues = z.infer<typeof episodeSchema>;

export function CreateEpisodeModal({ 
  seasonKey, 
  isOpen, 
  onClose 
}: { 
  seasonKey: string; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const mutation = useCreateEpisode();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: { 
      episodeNumber: 1, 
      title: '', 
      description: '', 
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 8.0
    }
  });

  const onSubmit = (data: EpisodeFormValues) => {
    const formattedDate = data.releaseDate.includes('T') ? data.releaseDate : `${data.releaseDate}T00:00:00Z`;
    
    mutation.mutate({ 
      seasonKey, 
      number: data.episodeNumber, 
      ...data,
      releaseDate: formattedDate
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 text-sm overflow-y-auto">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300 my-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
             <PlusCircle className="text-primary" /> Novo Episódio
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">Número</label>
              <Input type="number" {...register('episodeNumber', { valueAsNumber: true })} />
              {errors.episodeNumber && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.episodeNumber.message}</span>}
            </div>

            <div className="space-y-2.5">
              <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">
                 <Star size={10} /> Avaliação (0-10)
              </label>
              <Input type="number" step="0.1" {...register('rating', { valueAsNumber: true })} />
              {errors.rating && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.rating.message}</span>}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">
               <Type size={10} /> Título do Episódio
            </label>
            <Input {...register('title')} placeholder="Ex: No Meio do Caminho" />
            {errors.title && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.title.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">
               <Calendar size={10} /> Data de Lançamento
            </label>
            <Input type="date" {...register('releaseDate')} />
            {errors.releaseDate && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.releaseDate.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">
               <AlignLeft size={10} /> Sinopse
            </label>
            <Textarea {...register('description')} rows={3} placeholder="O que acontece neste episódio?" />
            {errors.description && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.description.message}</span>}
          </div>

          <div className="pt-6 flex gap-3">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
             <Button type="submit" disabled={mutation.isPending} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Criar Episódio"}
             </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function EditEpisodeModal({ 
  episode, 
  isOpen, 
  onClose 
}: { 
  episode: EpisodeEntity; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const mutation = useUpdateEpisode();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: { 
      episodeNumber: episode.episodeNumber, 
      title: episode.title, 
      description: episode.description, 
      releaseDate: episode.releaseDate ? episode.releaseDate.split('T')[0] : '',
      rating: episode.rating
    }
  });

  const onSubmit = (data: EpisodeFormValues) => {
    const formattedDate = data.releaseDate.includes('T') ? data.releaseDate : `${data.releaseDate}T00:00:00Z`;

    mutation.mutate({ 
      episodeKey: episode["@key"], 
      seasonKey: episode.season?.["@key"] || "", 
      number: data.episodeNumber,
      ...data,
      releaseDate: formattedDate
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 text-sm">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
             <Edit3 className="text-primary" /> Editar Episódio
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">Número</label>
              <Input type="number" {...register('episodeNumber', { valueAsNumber: true })} />
              {errors.episodeNumber && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.episodeNumber.message}</span>}
            </div>
            <div className="space-y-2.5">
              <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">Avaliação</label>
              <Input type="number" step="0.1" {...register('rating', { valueAsNumber: true })} />
              {errors.rating && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.rating.message}</span>}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">Título</label>
            <Input {...register('title')} />
            {errors.title && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.title.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">Data</label>
            <Input type="date" {...register('releaseDate')} />
            {errors.releaseDate && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.releaseDate.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label className="flex font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 items-center gap-2">Sinopse</label>
            <Textarea {...register('description')} rows={3} />
            {errors.description && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.description.message}</span>}
          </div>

          <div className="pt-6 flex gap-3">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
             <Button type="submit" disabled={mutation.isPending} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Alterações"}
             </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function DeleteEpisodeDialog({ 
  episode, 
  seasonKey,
  isOpen, 
  onClose 
}: { 
  episode: EpisodeEntity; 
  seasonKey: string;
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const mutation = useDeleteEpisode();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = () => {
    mutation.mutate({ episode: episode, seasonKey }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 text-sm">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-destructive/20 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="bg-destructive/10 p-5 rounded-2xl ring-1 ring-destructive/20">
            <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Remover Episódio?</h2>
            <p className="text-muted-foreground font-medium text-xs leading-relaxed">
              Você está prestes a remover <span className="text-destructive font-black underline underline-offset-4 decoration-2">&quot;{episode.title}&quot;</span> permanentemente.
            </p>
          </div>

          <div className="flex w-full gap-3 pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={mutation.isPending}
              className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20"
            >
              {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Episódio
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
