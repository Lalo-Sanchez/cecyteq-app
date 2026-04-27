"use client";

import React, { useState } from 'react';
import { enviarEntrega } from '@/actions/aula';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function EnviarEntregaForm({ 
  tareaId, 
  alumnoId, 
  entregaPrevia 
}: { 
  tareaId: number; 
  alumnoId: number;
  entregaPrevia: any;
}) {
  const [contenido, setContenido] = useState(entregaPrevia?.contenido || '');
  const [archivoUrl, setArchivoUrl] = useState(entregaPrevia?.archivoUrl || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido && !archivoUrl) {
      setError("Debes incluir texto o un enlace a tu archivo.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await enviarEntrega({
        tareaId,
        alumnoId,
        contenido,
        archivoUrl,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError("Ocurrió un error inesperado al enviar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-main border border-border-subtle rounded-3xl p-6 lg:p-10 shadow-inner">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-cecyteq-orange/10 text-cecyteq-orange flex items-center justify-center">
          <Upload size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Tu Entrega</h3>
          <p className="text-sm text-text-secondary">Añade el contenido de tu tarea o un enlace a tu documento.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Comentarios o Texto de Entrega</label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="w-full bg-bg-surface border border-border-subtle rounded-2xl p-4 text-text-primary focus:border-cecyteq-orange outline-none transition-all resize-none h-32"
            placeholder="Escribe tu respuesta aquí..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Enlace del Archivo (Drive, Docs, etc.)</label>
          <div className="relative group">
            <input
              type="url"
              value={archivoUrl}
              onChange={(e) => setArchivoUrl(e.target.value)}
              className="w-full bg-bg-surface border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:border-cecyteq-orange outline-none transition-all"
              placeholder="https://..."
            />
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-cecyteq-orange transition-colors" size={20} />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
          <button
            type="submit"
            disabled={loading}
            className="bg-cecyteq-orange hover:bg-cecyteq-orange/90 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl transition-all shadow-lg shadow-cecyteq-orange/20 active:scale-95 flex items-center justify-center min-w-[160px] disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (entregaPrevia ? 'Actualizar Entrega' : 'Enviar Tarea')}
          </button>
          {success && (
             <span className="flex items-center gap-2 text-cecyteq-green text-xs font-black uppercase tracking-widest animate-fadeIn">
               <CheckCircle size={16} /> Enviado con éxito
             </span>
          )}
        </div>
      </form>
    </div>
  );
}
