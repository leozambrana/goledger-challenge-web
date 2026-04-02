'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, PlusCircle, Tv } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { apiClient } from '../services/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTvShowStore } from '../store/tv-show-store';

// Definindo o schema com tipos primitivos simples para evitar ambiguidades no Resolver
const formSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  recommendedAge: z.number().min(0, "Mínimo 0").max(100, "Máximo 100"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTvShowModal() {
  const { isCreateModalOpen: isOpen, setCreateModalOpen: onClose } = useTvShowStore();
  const queryClient = useQueryClient();
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      recommendedAge: 0,
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => apiClient.createTvShow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ 'tv-shows' ] });
      reset();
      onClose(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
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
      <div className="relative w-full max-w-lg bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 p-2 rounded-xl">
                <Tv className="w-6 h-6 text-primary" />
             </div>
             <h2 className="text-2xl font-black tracking-tight">Nova Série de TV</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onClose(false)} className="rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </Button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2.5">
            <label htmlFor="title" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Título da Série</label>
            <Input 
               id="title" 
               placeholder="Ex: Breaking Bad" 
               {...register('title')} 
               className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.title && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.title.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label htmlFor="description" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Descrição / Sinopse</label>
            <Textarea 
               id="description" 
               placeholder="Conte um pouco sobre a série..." 
               rows={4}
               {...register('description')}
               className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.description && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-2.5">
                <label htmlFor="recommendedAge" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Idade Recomendada</label>
                <Input 
                   id="recommendedAge" 
                   type="number" 
                   {...register('recommendedAge', { valueAsNumber: true })}
                   className={errors.recommendedAge ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.recommendedAge && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.recommendedAge.message}</span>}
             </div>
          </div>

          <div className="pt-6 flex gap-3">
             <Button type="button" variant="outline" onClick={() => onClose(false)} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                Cancelar
             </Button>
             <Button type="submit" disabled={mutation.isPending} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Série
                  </>
                )}
             </Button>
          </div>
          
          {mutation.isError && (
             <p className="text-[10px] font-black text-destructive uppercase tracking-wide text-center">
                {mutation.error instanceof Error ? mutation.error.message : "Erro na criação."}
             </p>
          )}
        </form>
      </div>
    </div>
  );
}
