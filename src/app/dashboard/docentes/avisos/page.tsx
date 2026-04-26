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
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
          <Bell size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Avisos</h1>
          <p className="text-slate-400 text-sm mt-1">Publica comunicados importantes para la comunidad estudiantil y docente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950/80 border border-slate-800/60 rounded-[2rem] p-8 shadow-glow backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Título del Aviso</label>
                  <input 
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
                    placeholder="Ej. Suspensión de Labores"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Tipo de Aviso</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['General', 'Urgente', 'Evento'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({...formData, tipo: t})}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            formData.tipo === t 
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Destinatarios</label>
                    <select
                      value={formData.grupoId}
                      onChange={e => setFormData({...formData, grupoId: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
                    >
                      <option value="">Todos los Alumnos (Global)</option>
                      {grupos.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre} - {g.turno}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Contenido del Mensaje</label>
                  <textarea 
                    required
                    value={formData.contenido}
                    onChange={e => setFormData({...formData, contenido: e.target.value})}
                    rows={5}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
                    placeholder="Escribe aquí el detalle del aviso..."
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-sm animate-in fade-in zoom-in-95">
                  <CheckCircle size={18} />
                  Aviso publicado y enviado como notificación.
                </div>
              )}

              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isPending ? 'Enviando...' : 'Publicar Aviso Institucional'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Informativo */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Guía de Publicación</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1 text-orange-400 shrink-0"><Info size={16} /></div>
                <p className="text-xs text-slate-400"><strong className="text-slate-200">Avisos Generales:</strong> Para noticias de interés común, avisos de becas o circulares.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 text-red-400 shrink-0"><AlertTriangle size={16} /></div>
                <p className="text-xs text-slate-400"><strong className="text-slate-200">Avisos Urgentes:</strong> Aparecerán con mayor prioridad en el panel del alumno.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 text-cyan-400 shrink-0"><Calendar size={16} /></div>
                <p className="text-xs text-slate-400"><strong className="text-slate-200">Eventos:</strong> Invitaciones a ceremonias, desfiles o actividades extraescolares.</p>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-emerald-400 mb-2">Impacto Real</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Al publicar un aviso, se generará una notificación instantánea en el TopBar de todos los alumnos o docentes seleccionados, garantizando la visibilidad del mensaje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
