'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Trash2, AlertTriangle, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTvShowStore } from '../store/tv-show-store';

const formSchema = z.object({
  title: z.string().min(2, "O título da lista deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldTitle: string;
}

export function EditWatchlistModal({ isOpen, onClose, oldTitle }: EditWatchlistModalProps) {
  const { updateWatchlistTitle } = useTvShowStore();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: oldTitle }
  });

  React.useEffect(() => {
    if (isOpen) reset({ title: oldTitle });
  }, [isOpen, oldTitle, reset]);

  const onSubmit = async (data: FormValues) => {
    if (data.title === oldTitle) return onClose();
    setIsPending(true);
    setError(null);
    try {
      await updateWatchlistTitle(oldTitle, data.title);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar lista.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/20 p-2 rounded-xl">
                <Edit3 className="w-6 h-6 text-indigo-500" />
             </div>
             <h2 className="text-2xl font-black tracking-tight uppercase italic">Editar Lista</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
            <X size={20} />
          </Button>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2.5">
            <label className="block font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Novo Nome</label>
            <Input {...register('title')} className={errors.title ? "border-destructive" : ""} />
            {errors.title && <span className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.title.message}</span>}
          </div>
          <div className="pt-4 flex gap-3">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
             <Button type="submit" disabled={isPending} className="flex-1 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px]">
                {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Alterações"}
             </Button>
          </div>
          {error && <p className="text-[10px] font-black text-destructive uppercase text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}

interface DeleteWatchlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function DeleteWatchlistDialog({ isOpen, onClose, title }: DeleteWatchlistDialogProps) {
  const { deleteWatchlist } = useTvShowStore();
  const [isPending, setIsPending] = React.useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteWatchlist(title);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="bg-destructive/20 p-4 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2 uppercase italic">Excluir Lista?</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
            Deseja realmente excluir a lista <span className="text-foreground font-bold">&quot;{title}&quot;</span>? Esta ação não pode ser desfeita no blockchain.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
             <Button variant="outline" onClick={onClose} className="rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
             <Button onClick={handleDelete} disabled={isPending} variant="destructive" className="rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20">
                {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <><Trash2 className="mr-2 h-4 w-4"/> Excluir</>}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
