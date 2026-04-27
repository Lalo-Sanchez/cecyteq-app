"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { crearDocente } from '@/actions/docentes';

export default function NuevoDocentePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    especialidad: '',
    telefono: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await crearDocente(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/docentes/docentes'), 2000);
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
          <h2 className="text-2xl font-bold text-white">¡Docente Registrado!</h2>
          <p className="text-slate-400 mt-2">El docente y su cuenta de usuario han sido creados correctamente.</p>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Nuevo Docente</h1>
          <p className="text-slate-400 text-sm mt-1">Ingresa los datos para registrar un nuevo integrante al cuerpo docente.</p>
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800/60 rounded-[2rem] p-8 shadow-glow backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Nombres</label>
              <input 
                type="text"
                required
                value={formData.nombres}
                onChange={e => setFormData({...formData, nombres: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-cecyteq-green/50 transition-all"
                placeholder="Ej. Juan Carlos"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Apellidos</label>
              <input 
                type="text"
                required
                value={formData.apellidos}
                onChange={e => setFormData({...formData, apellidos: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-cecyteq-green/50 transition-all"
                placeholder="Ej. Pérez García"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Correo Institucional</label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-cecyteq-green/50 transition-all"
                placeholder="docente@cecyteq.edu.mx"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Especialidad</label>
              <input 
                type="text"
                value={formData.especialidad}
                onChange={e => setFormData({...formData, especialidad: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-cecyteq-green/50 transition-all"
                placeholder="Ej. Tecnologías de la Información"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block ml-1">Teléfono</label>
              <input 
                type="tel"
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-cecyteq-green/50 transition-all"
                placeholder="442 000 0000"
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
              {isPending ? 'Guardando...' : 'Registrar Docente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
