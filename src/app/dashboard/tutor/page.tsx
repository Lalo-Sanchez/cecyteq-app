"use client";

import React, { useState } from 'react';
import { Search, User, Award, BookOpen, Clock, ChevronRight, AlertCircle, Loader2, MapPin, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

export default function PortalTutorPage() {
  const [matricula, setMatricula] = useState('');
  const [alumno, setAlumno] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para la cita
  const [motivoCita, setMotivoCita] = useState('');
  const [solicitandoCita, setSolicitandoCita] = useState(false);
  const [citaSuccess, setCitaSuccess] = useState(false);
  const [citaError, setCitaError] = useState<string | null>(null);

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

  const handleSolicitarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoCita.trim() || !alumno) return;
    
    setSolicitandoCita(true);
    setCitaError(null);
    setCitaSuccess(false);

    try {
      // Usamos una API ficticia o action. Para propósitos de este prototipo, simulamos el éxito.
      // En una implementación real llamaríamos a solicitarCita() action.
      setTimeout(() => {
        setCitaSuccess(true);
        setMotivoCita('');
        setSolicitandoCita(false);
      }, 1000);
    } catch (err: any) {
      setCitaError("Error al solicitar cita.");
      setSolicitandoCita(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fadeInUp">
      <div className="relative overflow-hidden rounded-[3rem] border border-border-subtle bg-bg-surface p-12 shadow-glow">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,108,34,0.08),transparent_35%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase leading-tight">Portal del Tutor</h1>
            <p className="text-text-secondary font-medium max-w-lg text-lg">Consulta el rendimiento académico, asistencia institucional y solicita citas de forma segura y en tiempo real.</p>
          </div>
          
          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative group">
              <input 
                type="text" 
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="Matrícula del Estudiante..."
                className="w-full bg-bg-main border border-border-subtle rounded-[2rem] pl-14 pr-6 py-5 text-text-primary font-black outline-none focus:border-cecyteq-orange transition-all placeholder-text-secondary/20 shadow-inner text-lg tracking-widest"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-cecyteq-orange transition-colors" size={24} />
              <button 
                type="submit" 
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-cecyteq-orange hover:bg-cecyteq-orange/90 text-white p-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cecyteq-orange/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 flex items-center gap-6 text-red-500 animate-scaleIn">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-lg font-black uppercase tracking-tight">Expediente no encontrado</p>
            <p className="font-medium opacity-80">Por favor, verifique la matrícula institucional con el área de servicios escolares.</p>
          </div>
        </div>
      )}

      {alumno && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-scaleIn">
          {/* Tarjeta de Perfil */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 text-center shadow-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-cecyteq-orange"></div>
              <div className="w-28 h-28 bg-cecyteq-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-cecyteq-orange/20 shadow-inner group transition-transform hover:scale-105">
                <User size={56} className="text-cecyteq-orange group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-3xl font-black text-text-primary tracking-tighter leading-tight uppercase">{alumno.apellidoPaterno} {alumno.nombres}</h2>
              <p className="text-[10px] text-text-secondary font-black mt-2 uppercase tracking-[0.3em] bg-bg-main px-4 py-1.5 rounded-full inline-block border border-border-subtle">{alumno.matricula}</p>
              
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-bg-main p-5 rounded-3xl border border-border-subtle shadow-inner">
                  <p className="text-[9px] text-text-secondary uppercase font-black tracking-widest mb-2">Grupo</p>
                  <p className="text-2xl font-black text-cecyteq-green tracking-tighter">{alumno.grupo}</p>
                </div>
                <div className="bg-bg-main p-5 rounded-3xl border border-border-subtle shadow-inner">
                  <p className="text-[9px] text-text-secondary uppercase font-black tracking-widest mb-2">Faltas</p>
                  <p className={`text-2xl font-black tracking-tighter ${alumno.faltas > 10 ? 'text-red-500' : 'text-cecyteq-green'}`}>{alumno.faltas}</p>
                </div>
              </div>
            </div>

            <div className="bg-cecyteq-green/5 border border-cecyteq-green/10 rounded-[2.5rem] p-10 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-cecyteq-green/20 rounded-xl flex items-center justify-center text-cecyteq-green"><Award size={22} /></div>
                <h3 className="font-black text-text-primary uppercase text-[10px] tracking-widest">Estatus Académico</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                El estudiante se encuentra actualmente en estatus <strong className="text-cecyteq-green font-black">{alumno.estatus}</strong>. Su desempeño refleja un promedio consolidado de <strong className="text-text-primary font-black text-lg">8.4</strong>.
              </p>
              <div className="flex items-center gap-2 text-text-secondary/40 text-[9px] font-black uppercase tracking-widest pt-2">
                <MapPin size={12} /> Plantel No. 5
              </div>
            </div>
            
            {/* Módulo de Comunicación y Citas */}
            <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 shadow-glow space-y-6">
               <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
                 <Calendar className="text-cecyteq-orange" size={24} />
                 <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Agendar Cita</h3>
               </div>
               
               <form onSubmit={handleSolicitarCita} className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Motivo de la Cita</label>
                   <textarea
                     value={motivoCita}
                     onChange={(e) => setMotivoCita(e.target.value)}
                     required
                     className="w-full bg-bg-main border border-border-subtle rounded-2xl p-4 text-text-primary focus:border-cecyteq-orange outline-none transition-all resize-none h-24 text-sm"
                     placeholder="Ej. Deseo revisar las inasistencias de mi hijo con su docente tutor..."
                   />
                 </div>
                 
                 {citaError && <p className="text-red-400 text-xs font-bold">{citaError}</p>}
                 
                 <button 
                   type="submit" 
                   disabled={solicitandoCita}
                   className="w-full bg-bg-main border border-border-subtle hover:bg-cecyteq-orange hover:text-white hover:border-cecyteq-orange text-cecyteq-orange font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                 >
                   {solicitandoCita ? <Loader2 size={16} className="animate-spin" /> : <><MessageSquare size={16} /> Solicitar Cita</>}
                 </button>
                 
                 {citaSuccess && (
                   <div className="bg-cecyteq-green/10 text-cecyteq-green p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                     <CheckCircle size={14} /> Solicitud enviada a Servicios Escolares
                   </div>
                 )}
               </form>
            </div>
          </div>

          {/* Calificaciones */}
          <div className="lg:col-span-2">
            <div className="bg-bg-surface border border-border-subtle rounded-[3rem] overflow-hidden shadow-glow h-full">
              <div className="p-10 border-b border-border-subtle bg-bg-main/30 flex justify-between items-center">
                <h3 className="text-2xl font-black text-text-primary flex items-center gap-4 uppercase tracking-tighter">
                  <BookOpen className="text-cecyteq-orange w-8 h-8" /> Historial de Materias
                </h3>
                <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest border border-border-subtle px-4 py-1.5 rounded-full">Periodo 2024-2025</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-bg-main/20 text-text-secondary text-[10px] font-black uppercase tracking-widest border-b border-border-subtle">
                    <tr>
                      <th className="px-10 py-5">Asignatura Académica</th>
                      <th className="px-6 py-5 text-center">P1</th>
                      <th className="px-6 py-5 text-center">P2</th>
                      <th className="px-6 py-5 text-center">P3</th>
                      <th className="px-10 py-5 text-right">Resultado Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50 text-text-primary">
                    {alumno.calificaciones.map((cal: any) => (
                      <tr key={cal.materia} className="group hover:bg-bg-main/30 transition-colors">
                        <td className="px-10 py-6">
                          <p className="font-black text-text-primary group-hover:text-cecyteq-orange transition-colors uppercase tracking-tight">{cal.materia}</p>
                        </td>
                        <td className="px-6 py-6 text-center font-black text-text-secondary/40 text-base">{cal.parcial1 || '—'}</td>
                        <td className="px-6 py-6 text-center font-black text-text-secondary/40 text-base">{cal.parcial2 || '—'}</td>
                        <td className="px-6 py-6 text-center font-black text-text-secondary/40 text-base">{cal.parcial3 || '—'}</td>
                        <td className="px-10 py-6 text-right">
                          <span className={`text-2xl font-black tracking-tighter ${cal.final >= 6 ? 'text-cecyteq-green' : 'text-red-500'}`}>
                            {cal.final || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-8 bg-bg-main/30 border-t border-border-subtle flex justify-center">
                <p className="text-[9px] text-text-secondary/40 font-black uppercase tracking-[0.2em] italic">Información para fines de consulta administrativa · CECYTEQ Oficial</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
