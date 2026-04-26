"use client";

import React, { useState, useTransition } from 'react';
import { Star, MessageSquare, Save, Loader2, X, ExternalLink } from 'lucide-react';
import { calificarEntrega } from '@/actions/aula';

interface Props {
  entrega: any;
}

export default function CalificarEntregaForm({ entrega }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [calificacion, setCalificacion] = useState(entrega.calificacion || '');
  const [retro, setRetro] = useState(entrega.retroalimentacion || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await calificarEntrega(entrega.id, {
        calificacion: Number(calificacion),
        retroalimentacion: retro
      });
      if (res.success) {
        setIsOpen(false);
      } else {
        alert("Error: " + res.error);
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
      >
        Revisar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-glow overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-xl font-bold text-white">Revisión de Entrega</h3>
                <p className="text-xs text-slate-400 mt-1">{entrega.alumno.apellidoPaterno} {entrega.alumno.nombres}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Contenido de la entrega</p>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {entrega.contenido || 'Sin contenido de texto.'}
                </div>
                {entrega.archivoUrl && (
                  <a 
                    href={entrega.archivoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-3 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors"
                  >
                    <ExternalLink size={14} /> Ver archivo adjunto
                  </a>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2 block">Calificación (0-10)</label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                      <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value={calificacion}
                        onChange={e => setCalificacion(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-lg font-bold outline-none focus:ring-1 focus:ring-amber-500/50"
                        placeholder="10.0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2 block">Retroalimentación</label>
                  <textarea 
                    value={retro}
                    onChange={e => setRetro(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                    placeholder="Buen trabajo, sigue así..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl text-sm font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isPending ? 'Guardando...' : 'Guardar Nota'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
