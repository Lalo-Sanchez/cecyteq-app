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
        className="bg-cecyteq-green/10 hover:bg-cecyteq-green text-cecyteq-green hover:text-white border border-cecyteq-green/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
      >
        Revisar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-bg-main/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] w-full max-w-lg shadow-glow overflow-hidden animate-scaleIn">
            <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-bg-main/50">
              <div>
                <h3 className="text-2xl font-black text-text-primary tracking-tight uppercase">Calificar Entrega</h3>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1">{entrega.alumno.apellidoPaterno} {entrega.alumno.nombres}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-4 ml-1">Contenido Recibido</p>
                <div className="bg-bg-main border border-border-subtle rounded-2xl p-5 text-sm text-text-primary font-medium max-h-48 overflow-y-auto whitespace-pre-wrap shadow-inner leading-relaxed">
                  {entrega.contenido || 'Sin contenido de texto registrado por el alumno.'}
                </div>
                {entrega.archivoUrl && (
                  <a 
                    href={entrega.archivoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-2 text-cecyteq-orange hover:text-cecyteq-orange/80 text-[10px] font-black uppercase tracking-widest transition-all w-fit px-2"
                  >
                    <ExternalLink size={14} /> Abrir archivo adjunto
                  </a>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-6 pt-8 border-t border-border-subtle">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-3 ml-1 block">Nota Final (0.0 - 10.0)</label>
                    <div className="relative">
                      <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-cecyteq-orange" size={18} />
                      <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value={calificacion}
                        onChange={e => setCalificacion(e.target.value)}
                        className="w-full bg-bg-main border border-border-subtle rounded-2xl pl-12 pr-6 py-4 text-text-primary text-xl font-black outline-none focus:border-cecyteq-orange transition-all"
                        placeholder="0.0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-3 ml-1 block">Retroalimentación del Docente</label>
                  <textarea 
                    value={retro}
                    onChange={e => setRetro(e.target.value)}
                    rows={4}
                    className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-sm text-text-primary font-medium outline-none focus:border-cecyteq-green transition-all resize-none shadow-inner"
                    placeholder="Escribe comentarios para el estudiante..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-bg-main border border-border-subtle text-text-secondary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="flex-[1.5] bg-cecyteq-green hover:bg-cecyteq-green/90 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-cecyteq-green/20 hover:scale-[1.02]"
                  >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isPending ? 'Guardando...' : 'Asignar Calificación'}
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
