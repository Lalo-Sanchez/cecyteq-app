"use client";

import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { crearGrupo } from '@/actions/grupos';

export default function CrearGrupoModal({ generaciones }: { generaciones: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [turno, setTurno] = useState('Matutino');
  const [generacionId, setGeneracionId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await crearGrupo({
      nombre,
      turno,
      generacionId: generacionId ? Number(generacionId) : undefined,
    });
    setLoading(false);
    if (res.success) {
      setIsOpen(false);
      setNombre('');
      setTurno('Matutino');
      setGeneracionId('');
    } else {
      alert("Error al crear grupo: " + res.error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-cecyteq-green hover:bg-cecyteq-green/90 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-cecyteq-green/20 flex items-center gap-2"
      >
        <Plus size={18} /> Crear Grupo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Nuevo Grupo</h2>
              <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-red-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Nombre / Semestre</label>
                <input 
                  type="text" 
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej. 1A Programación"
                  className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-green outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Turno</label>
                <select 
                  value={turno}
                  onChange={e => setTurno(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-green outline-none transition-all appearance-none"
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Generación (Opcional)</label>
                <select 
                  value={generacionId}
                  onChange={e => setGeneracionId(Number(e.target.value))}
                  className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-green outline-none transition-all appearance-none"
                >
                  <option value="">-- Sin asignar --</option>
                  {generaciones.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-cecyteq-green hover:bg-cecyteq-green/90 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-cecyteq-green/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Crear Grupo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
