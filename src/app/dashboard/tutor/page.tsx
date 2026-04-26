"use client";

import React, { useState } from 'react';
import { Search, User, Award, BookOpen, Clock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

export default function PortalTutorPage() {
  const [matricula, setMatricula] = useState('');
  const [alumno, setAlumno] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim()) return;

    setIsLoading(true);
    setError(null);
    setAlumno(null);

    try {
      const res = await fetch(`/api/calificaciones?matricula=${matricula}`);
      if (!res.ok) throw new Error("No se encontró al alumno.");
      const data = await res.json();
      setAlumno(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800/60 bg-slate-950/90 p-10 shadow-glow">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,100,33,0.1),transparent_25%)]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight">Portal del Tutor</h1>
            <p className="text-slate-400 mt-2 max-w-md">Consulta el rendimiento académico y asistencia de tu hijo/a de forma instantánea.</p>
          </div>
          
          <form onSubmit={handleSearch} className="w-full max-w-sm">
            <div className="relative group">
              <input 
                type="text" 
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="Ingresa la Matrícula..."
                className="w-full bg-slate-900 border border-slate-800 rounded-3xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder-slate-600 shadow-xl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={20} />
              <button 
                type="submit" 
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-center gap-4 text-red-400 animate-in slide-in-from-top-4">
          <AlertCircle size={24} />
          <div>
            <p className="font-bold">Alumno no encontrado</p>
            <p className="text-sm opacity-80">Verifica la matrícula e intenta de nuevo.</p>
          </div>
        </div>
      )}

      {alumno && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Tarjeta de Perfil */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-center shadow-lg">
              <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                <User size={48} className="text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{alumno.apellidoPaterno} {alumno.nombres}</h2>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">{alumno.matricula}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Grupo</p>
                  <p className="text-lg font-black text-emerald-400">{alumno.grupo}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Faltas</p>
                  <p className={`text-lg font-black ${alumno.faltas > 10 ? 'text-red-400' : 'text-emerald-400'}`}>{alumno.faltas}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><Award size={20} /></div>
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Estatus Académico</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                El alumno se encuentra en estatus <strong className="text-emerald-400">{alumno.estatus}</strong>. Su promedio parcial actual es de <strong className="text-white text-lg">8.4</strong>.
              </p>
            </div>
          </div>

          {/* Calificaciones */}
          <div className="lg:col-span-2">
            <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
              <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="text-orange-500" /> Boleta de Calificaciones
                </h3>
                <span className="text-xs text-slate-500 font-mono uppercase tracking-tighter">Ciclo 2024-2025</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/30 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-8 py-4">Materia</th>
                      <th className="px-8 py-4 text-center">P1</th>
                      <th className="px-8 py-4 text-center">P2</th>
                      <th className="px-8 py-4 text-center">P3</th>
                      <th className="px-8 py-4 text-center">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {alumno.calificaciones.map((cal: any) => (
                      <tr key={cal.materia} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-100">{cal.materia}</p>
                        </td>
                        <td className="px-8 py-5 text-center font-medium text-slate-400">{cal.parcial1 || '—'}</td>
                        <td className="px-8 py-5 text-center font-medium text-slate-400">{cal.parcial2 || '—'}</td>
                        <td className="px-8 py-5 text-center font-medium text-slate-400">{cal.parcial3 || '—'}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`text-lg font-black ${cal.final >= 6 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {cal.final || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-slate-900/30 border-t border-slate-800 flex justify-center">
                <p className="text-[10px] text-slate-600 italic">Esta información es de carácter informativo y no sustituye a la boleta oficial.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
