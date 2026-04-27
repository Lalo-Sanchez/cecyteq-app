"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Bell, Send, Users, AlertTriangle, Info, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { publicarAviso } from '@/actions/avisos';

export default function AvisosAdminPage() {
  const [isPending, startTransition] = useTransition();
  const [grupos, setGrupos] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'General' as 'General' | 'Urgente' | 'Evento',
    grupoId: '' as string,
  });

  useEffect(() => {
    fetch('/api/grupos')
      .then(res => res.json())
      .then(data => setGrupos(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await publicarAviso({
        ...formData,
        grupoId: formData.grupoId ? Number(formData.grupoId) : undefined
      });
      if (res.success) {
        setSuccess(true);
        setFormData({ titulo: '', contenido: '', tipo: 'General', grupoId: '' });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeInUp">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-cecyteq-orange/10 border border-cecyteq-orange/20 rounded-3xl flex items-center justify-center text-cecyteq-orange shadow-glow">
          <Bell size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">Centro de Avisos</h1>
          <p className="text-text-secondary font-medium mt-1">Publica comunicados institucionales para la comunidad CECYTEQ.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 shadow-glow">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Título del Aviso</label>
                  <input 
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-text-primary font-bold outline-none focus:border-cecyteq-orange transition-all"
                    placeholder="Ej. Suspensión de Labores"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Prioridad / Categoría</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['General', 'Urgente', 'Evento'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({...formData, tipo: t})}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            formData.tipo === t 
                            ? 'bg-cecyteq-orange text-white border-cecyteq-orange shadow-lg shadow-cecyteq-orange/20' 
                            : 'bg-bg-main border-border-subtle text-text-secondary hover:border-text-secondary'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Alcance / Destinatarios</label>
                    <select
                      value={formData.grupoId}
                      onChange={e => setFormData({...formData, grupoId: e.target.value})}
                      className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-text-primary font-bold outline-none focus:border-cecyteq-green transition-all appearance-none"
                    >
                      <option value="">Todos los Alumnos (Global)</option>
                      {grupos.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre} - {g.turno}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Cuerpo del Comunicado</label>
                  <textarea 
                    required
                    value={formData.contenido}
                    onChange={e => setFormData({...formData, contenido: e.target.value})}
                    rows={6}
                    className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-text-primary font-medium outline-none focus:border-cecyteq-orange transition-all resize-none shadow-inner leading-relaxed"
                    placeholder="Escribe el mensaje detallado aquí..."
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-3 text-red-400 text-sm font-bold">
                  <AlertTriangle size={20} />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-cecyteq-green/10 border border-cecyteq-green/20 rounded-2xl p-5 flex items-center gap-3 text-cecyteq-green text-sm font-black uppercase tracking-widest animate-scaleIn">
                  <CheckCircle size={20} />
                  Comunicado emitido correctamente
                </div>
              )}

              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-cecyteq-orange hover:bg-cecyteq-orange/90 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-cecyteq-orange/20 disabled:opacity-50 hover:scale-[1.01]"
              >
                {isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isPending ? 'Procesando Envío...' : 'Publicar Comunicado Oficial'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Informativo */}
        <div className="space-y-8">
          <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-inner">
            <h3 className="text-xs font-black text-text-primary mb-6 uppercase tracking-[0.25em] border-b border-border-subtle pb-4">Guía de Uso</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 text-cecyteq-green shrink-0"><Info size={20} /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-cecyteq-green tracking-widest">Generales</p>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">Noticias de interés común, avisos de becas o circulares administrativas.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 text-red-500 shrink-0"><AlertTriangle size={20} /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Urgentes</p>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">Avisos que requieren atención inmediata y aparecerán resaltados en el panel.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 text-cecyteq-orange shrink-0"><Calendar size={20} /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-cecyteq-orange tracking-widest">Eventos</p>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">Invitaciones a ceremonias, desfiles, actividades académicas o deportivas.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-cecyteq-green/5 border border-cecyteq-green/10 rounded-[2rem] p-8">
            <h3 className="text-xs font-black text-cecyteq-green mb-3 uppercase tracking-widest">Dato del Sistema</h3>
            <p className="text-[11px] text-text-secondary/70 leading-relaxed font-medium italic">
              "Cada aviso publicado se sincroniza en tiempo real con las notificaciones de los usuarios destino, garantizando una comunicación efectiva 24/7."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
