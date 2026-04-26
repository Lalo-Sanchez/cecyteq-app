"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { crearMateriaAccion } from '@/actions/materias';

export default function NuevaMateriaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    creditos: 5,
    semestre: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await crearMateriaAccion(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/docentes/materias'), 2000);
      } else {
        setError(res.error);
      }
    });
  };

  if (success) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Materia Registrada!</h2>
          <p className="text-slate-400 mt-2">La materia ha sido añadida exitosamente al catálogo institucional.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeInUp">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nueva Materia</h1>
          <p className="text-slate-400 text-sm mt-1">Registra una asignatura nueva en el catálogo de la institución.</p>
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800/60 rounded-[2rem] p-8 shadow-glow backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Nombre de la Asignatura</label>
              <input 
                type="text"
                required
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="Ej. CÁLCULO DIFERENCIAL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Semestre</label>
                <select 
                  value={formData.semestre}
                  onChange={e => setFormData({...formData, semestre: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Créditos</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.creditos}
                  onChange={e => setFormData({...formData, creditos: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Descripción / Objetivos</label>
              <textarea 
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                placeholder="Describe brevemente el contenido de la materia..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-slate-900 border border-slate-800 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isPending ? 'Guardando...' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
