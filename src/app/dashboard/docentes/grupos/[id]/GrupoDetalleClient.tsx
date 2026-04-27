"use client";

import React, { useState } from 'react';
import { Plus, X, Trash2, Calendar, BookOpen, User, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { asignarDocenteMateria, eliminarAsignacionMateria, guardarHorario, eliminarHorario } from '@/actions/grupos';
import Link from 'next/link';

export default function GrupoDetalleClient({ 
  grupo, 
  docentes, 
  materias 
}: { 
  grupo: any;
  docentes: any[];
  materias: any[];
}) {
  const [docenteId, setDocenteId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [loadingAssign, setLoadingAssign] = useState(false);

  // Estados para horarios
  const [activeAsignacionId, setActiveAsignacionId] = useState<number | null>(null);
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docenteId || !materiaId) return;

    setLoadingAssign(true);
    const res = await asignarDocenteMateria({
      grupoId: grupo.id,
      docenteId: Number(docenteId),
      materiaId: Number(materiaId),
    });
    setLoadingAssign(false);

    if (res.success) {
      setDocenteId('');
      setMateriaId('');
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleRemoveAssign = async (id: number) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    await eliminarAsignacionMateria(id);
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsignacionId || !horaInicio || !horaFin) return;

    setLoadingSchedule(true);
    const res = await guardarHorario({
      grupoDocenteId: activeAsignacionId,
      diaSemana,
      horaInicio,
      horaFin
    });
    setLoadingSchedule(false);

    if (res.success) {
      setHoraInicio('');
      setHoraFin('');
      setActiveAsignacionId(null);
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleRemoveSchedule = async (id: number) => {
    if (!confirm("¿Eliminar este bloque de horario?")) return;
    await eliminarHorario(id);
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      <Link href="/dashboard/docentes/grupos" className="inline-flex items-center gap-2 text-text-secondary hover:text-cecyteq-green transition-all text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={14} /> Volver a Grupos
      </Link>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-cecyteq-green"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Grupo {grupo.nombre}</h1>
            <p className="text-text-secondary mt-1 font-medium text-lg uppercase tracking-widest">{grupo.turno}</p>
          </div>
          <div className="bg-bg-main border border-border-subtle px-6 py-4 rounded-2xl shadow-inner text-center">
            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-1">Materias Asignadas</p>
            <p className="text-2xl font-black text-cecyteq-green">{grupo.docenteGrupos.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asignar Materia/Docente */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-glow">
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2 mb-6">
              <Plus className="text-cecyteq-green" /> Asignar Materia
            </h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Materia</label>
                <select 
                  required
                  value={materiaId}
                  onChange={e => setMateriaId(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-green outline-none transition-all"
                >
                  <option value="">Selecciona materia...</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Docente Titular</label>
                <select 
                  required
                  value={docenteId}
                  onChange={e => setDocenteId(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-green outline-none transition-all"
                >
                  <option value="">Selecciona docente...</option>
                  {docentes.map(d => (
                    <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loadingAssign}
                className="w-full bg-cecyteq-green hover:bg-cecyteq-green/90 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-lg shadow-cecyteq-green/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loadingAssign ? <Loader2 size={16} className="animate-spin" /> : "Vincular al Grupo"}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Materias y Horarios */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-glow min-h-[400px]">
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2 mb-6">
              <BookOpen className="text-cecyteq-orange" /> Plan de Estudios y Horarios
            </h3>

            {grupo.docenteGrupos.length === 0 ? (
              <div className="text-center py-12 text-text-secondary font-medium bg-bg-main/50 rounded-2xl border border-border-subtle">
                Aún no hay materias asignadas a este grupo.
              </div>
            ) : (
              <div className="space-y-6">
                {grupo.docenteGrupos.map((dg: any) => (
                  <div key={dg.id} className="bg-bg-main border border-border-subtle rounded-2xl overflow-hidden shadow-inner group transition-all hover:border-cecyteq-orange/30">
                    <div className="p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-black text-text-primary tracking-tight">{dg.materia.nombre}</h4>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-1 font-medium">
                          <User size={12} className="text-cecyteq-orange" /> {dg.docente.nombres} {dg.docente.apellidos}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setActiveAsignacionId(dg.id)}
                          className="bg-bg-surface border border-border-subtle hover:border-cecyteq-orange text-cecyteq-orange px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          + Horario
                        </button>
                        <button 
                          onClick={() => handleRemoveAssign(dg.id)}
                          className="text-text-secondary hover:text-red-400 p-2 transition-colors"
                          title="Eliminar asignación"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Lista de horarios de esta materia */}
                    {dg.horarios && dg.horarios.length > 0 && (
                      <div className="p-4 bg-bg-surface/30">
                        <div className="flex flex-wrap gap-2">
                          {dg.horarios.map((h: any) => (
                            <div key={h.id} className="flex items-center gap-2 bg-bg-main border border-border-subtle px-3 py-1.5 rounded-lg text-xs font-bold text-text-primary">
                              <span className="text-cecyteq-green">{h.diaSemana}</span>
                              <span className="opacity-50">|</span>
                              <span>{h.horaInicio} - {h.horaFin}</span>
                              <button onClick={() => handleRemoveSchedule(h.id)} className="ml-1 text-text-secondary hover:text-red-400 transition-colors">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para agregar horario */}
      {activeAsignacionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
              <Calendar className="text-cecyteq-orange" size={24} /> Agregar Bloque
            </h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Día de la Semana</label>
                <select 
                  value={diaSemana}
                  onChange={e => setDiaSemana(e.target.value)}
                  className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-orange outline-none transition-all appearance-none"
                >
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Inicio</label>
                  <input 
                    type="time" 
                    required
                    value={horaInicio}
                    onChange={e => setHoraInicio(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-orange outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 ml-1">Fin</label>
                  <input 
                    type="time" 
                    required
                    value={horaFin}
                    onChange={e => setHoraFin(e.target.value)}
                    className="w-full bg-bg-main border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cecyteq-orange outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveAsignacionId(null)}
                  className="flex-1 border border-border-subtle text-text-secondary font-bold py-3 rounded-xl hover:bg-bg-main transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loadingSchedule}
                  className="flex-1 bg-cecyteq-orange hover:bg-cecyteq-orange/90 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center"
                >
                  {loadingSchedule ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
