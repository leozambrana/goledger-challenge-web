'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save, Tv } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { createPortal } from 'react-dom';
import { TvShowEntity } from '../types';
import { useUpdateTVShow } from '../hooks/use-tv-shows';

const formSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  recommendedAge: z.number().min(0, "Mínimo 0").max(100, "Máximo 100"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTvShowModalProps {
  tvShow: TvShowEntity;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTvShowModal({ tvShow, isOpen, onClose }: EditTvShowModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: tvShow.title,
      description: tvShow.description,
      recommendedAge: tvShow.recommendedAge,
    }
  });

  const mutation = useUpdateTVShow();

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ title: tvShow.title, data }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: tvShow.title,
        description: tvShow.description,
        recommendedAge: tvShow.recommendedAge,
      });
    }
  }, [isOpen, tvShow, reset]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 p-2 rounded-xl">
                <Tv className="w-6 h-6 text-primary" />
             </div>
             <h2 className="text-2xl font-black tracking-tight">Editar Série</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </Button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2.5">
            <label htmlFor="title-edit" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1 text-[10px]">Título (Identificador)</label>
            <Input id="title-edit" {...register('title')} disabled className="bg-muted/50 font-mono text-xs" />
            <p className="text-[9px] text-muted-foreground ml-1 italic opacity-60 uppercase font-black tracking-tighter">O título é a chave primária e não pode ser alterado.</p>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="description-edit" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1 text-[10px]">Sinopse / Descrição</label>
            <Textarea id="description-edit" rows={4} {...register('description')} className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""} />
            {errors.description && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.description.message}</span>}
          </div>

          <div className="space-y-2.5">
            <label htmlFor="recommendedAge-edit" className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1 text-[10px]">Idade Recomendada</label>
            <Input id="recommendedAge-edit" type="number" {...register('recommendedAge', { valueAsNumber: true })} className={errors.recommendedAge ? "border-destructive focus-visible:ring-destructive" : ""} />
            {errors.recommendedAge && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.recommendedAge.message}</span>}
          </div>

          <div className="pt-6 flex gap-3">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                Cancelar
             </Button>
             <Button type="submit" disabled={mutation.isPending} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
             </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
