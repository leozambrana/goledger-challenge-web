'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, PlusCircle, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCreateSeason, useUpdateSeason, useDeleteSeason } from '../hooks/use-seasons';
import { SeasonEntity } from '../types';
import { createPortal } from 'react-dom';

const seasonSchema = z.object({
  number: z.number().min(1, "O número deve ser pelo menos 1"),
  year: z.number().min(1900, "Ano inválido").max(2100, "Ano inválido"),
});

type SeasonFormValues = z.infer<typeof seasonSchema>;

// --- Create Season Modal ---
export function CreateSeasonModal({ 
  tvShowKey, 
  isOpen, 
  onClose 
}: { 
  tvShowKey: string; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const mutation = useCreateSeason();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { number: 1, year: new Date().getFullYear() }
  });

  const onSubmit = (data: SeasonFormValues) => {
    mutation.mutate({ tvShowKey, ...data }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 text-sm">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
             <PlusCircle className="text-primary" /> Nova Temporada
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2.5">
            <label className="block font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Número da Temporada</label>
            <Input type="number" {...register('number', { valueAsNumber: true })} />
            {errors.number && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.number.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label className="block font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Ano de Lançamento</label>
            <Input type="number" {...register('year', { valueAsNumber: true })} />
            {errors.year && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.year.message}</span>}
          </div>

          <div className="pt-6 flex gap-3">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
             <Button type="submit" disabled={mutation.isPending} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Criar Temporada"}
             </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// --- Edit Season Modal ---
export function EditSeasonModal({ 
  season, 
  isOpen, 
  onClose 
}: { 
  season: SeasonEntity; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const mutation = useUpdateSeason();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { number: season.number, year: season.year }
  });

  const onSubmit = (data: SeasonFormValues) => {
    mutation.mutate({ seasonKey: season["@key"], ...data }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 text-sm">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
             <Edit3 className="text-primary" /> Editar Temporada
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2.5">
            <label className="block font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Número da Temporada</label>
            <Input type="number" {...register('number', { valueAsNumber: true })} />
            {errors.number && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.number.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label className="block font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Ano de Lançamento</label>
            <Input type="number" {...register('year', { valueAsNumber: true })} />
            {errors.year && <span className="text-[10px] text-destructive font-black uppercase tracking-wide ml-1">{errors.year.message}</span>}
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

export function DeleteSeasonDialog({ 
  season, 
  tvShowKey,
  isOpen, 
  onClose 
}: { 
  season: SeasonEntity; 
  tvShowKey: string;
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const mutation = useDeleteSeason();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = () => {
    mutation.mutate({ season: season, tvShowKey }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 text-sm">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-destructive/20 shadow-2xl rounded-3xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="bg-destructive/10 p-5 rounded-2xl ring-1 ring-destructive/20">
            <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Excluir Temporada?</h2>
            <p className="text-muted-foreground font-medium text-xs leading-relaxed">
              Você está prestes a remover permanentemente a <span className="text-destructive font-black">Temporada {season.number}</span> do registro blockchain.
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
              {mutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Registro
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
