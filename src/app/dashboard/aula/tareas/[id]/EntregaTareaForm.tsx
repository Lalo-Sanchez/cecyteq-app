"use client";

import React, { useState, useTransition } from 'react';
import { Send, Loader2, AlertCircle, FilePlus } from 'lucide-react';
import { enviarEntrega } from '@/actions/aula';

interface Props {
  tareaId: number;
  alumnoId: number;
}

export default function EntregaTareaForm({ tareaId, alumnoId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    startTransition(async () => {
      const res = await enviarEntrega({
        tareaId,
        alumnoId,
        contenido
      });
      if (!res.success) {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Respuesta de la Tarea</label>
        <textarea 
          value={contenido}
          onChange={e => setContenido(e.target.value)}
          placeholder="Escribe tu respuesta aquí o pega el link de tu trabajo..."
          className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-shadow"
          required
        />
      </div>

      <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center group hover:border-slate-700 transition-colors cursor-pointer">
        <FilePlus className="mx-auto text-slate-600 group-hover:text-emerald-400 mb-2 transition-colors" size={24} />
        <p className="text-xs text-slate-500 font-medium">Adjuntar archivos (PDF, DOCX)</p>
        <p className="text-[10px] text-slate-700 mt-1">Máximo 10MB</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button 
        type="submit"
        disabled={isPending || !contenido.trim()}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Entregar Tarea
      </button>
    </form>
  );
}
