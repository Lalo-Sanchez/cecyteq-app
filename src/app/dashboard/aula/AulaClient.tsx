"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  FileText, 
  Users, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { crearTarea, eliminarTarea } from '@/actions/aula';

type Tarea = {
  id: number;
  titulo: string;
  descripcion: string | null;
  materia: string;
  fechaVencimiento: Date | null;
  grupo: { nombre: string };
  _count: { entregas: number };
};

type Grupo = {
  id: number;
  nombre: string;
};

interface Props {
  role: string;
  tareas: Tarea[];
  grupos: Grupo[];
  docenteId: number;
}

export default function AulaClient({ role, tareas, grupos, docenteId }: Props) {
  const [activeTab, setActiveTab] = useState('tareas');
  const [isModoNuevo, setIsModoNuevo] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [grupoId, setGrupoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleCrearTarea = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await crearTarea({
        titulo,
        descripcion,
        materia,
        fechaVencimiento: fecha,
        grupoId: Number(grupoId),
        docenteId
      });
      if (res.success) {
        setIsModoNuevo(false);
        setTitulo('');
        setMateria('');
        setGrupoId('');
        setFecha('');
        setDescripcion('');
      } else {
        alert("Error: " + res.error);
      }
    });
  };

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      startTransition(async () => {
        await eliminarTarea(id);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('tareas')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'tareas' ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Tareas y Proyectos
          {activeTab === 'tareas' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400" />}
        </button>
        <button 
          onClick={() => setActiveTab('avisos')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'avisos' ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Avisos del Aula
          {activeTab === 'avisos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400" />}
        </button>
      </div>

      {activeTab === 'tareas' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">Actividades Académicas</h3>
              <p className="text-sm text-slate-400">Gestiona las tareas y entregas de tus grupos.</p>
            </div>
            {role !== 'alumno' && (
              <button 
                onClick={() => setIsModoNuevo(!isModoNuevo)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95"
              >
                {isModoNuevo ? <Clock size={18} /> : <Plus size={18} />}
                {isModoNuevo ? 'Cerrar Formulario' : 'Nueva Tarea'}
              </button>
            )}
          </div>

          {isModoNuevo && (
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-glow animate-in slide-in-from-top-4">
              <form onSubmit={handleCrearTarea} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Título de la Actividad</label>
                  <input 
                    type="text" 
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Ej. Proyecto Final: Algoritmos de Ordenamiento"
                    className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500/50 transition-shadow"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Materia</label>
                  <input 
                    type="text" 
                    value={materia}
                    onChange={e => setMateria(e.target.value)}
                    placeholder="Ej. Programación III"
                    className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Grupo</label>
                  <select 
                    value={grupoId}
                    onChange={e => setGrupoId(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
                    required
                  >
                    <option value="">Seleccionar grupo</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Fecha de Entrega</label>
                  <input 
                    type="date" 
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Instrucciones / Descripción</label>
                  <textarea 
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    rows={3}
                    placeholder="Detalla los requisitos de la tarea..."
                    className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    Publicar Tarea
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listado de Tareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tareas.length === 0 ? (
              <div className="md:col-span-full py-12 text-center bg-slate-900/30 border border-slate-800 rounded-3xl">
                <FileText className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-400 font-medium">No hay tareas publicadas actualmente.</p>
              </div>
            ) : (
              tareas.map(tarea => (
                <div key={tarea.id} className="group bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                      {tarea.materia}
                    </div>
                    {role !== 'alumno' && (
                      <button 
                        onClick={() => handleEliminar(tarea.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors">{tarea.titulo}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">{tarea.descripcion || 'Sin descripción adicional.'}</p>
                  
                  <div className="space-y-2.5 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Users size={14} className="text-slate-500" />
                      <span>Grupo: <strong className="text-slate-100">{tarea.grupo.nombre}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Calendar size={14} className="text-slate-500" />
                      <span>Vence: <strong className={tarea.fechaVencimiento ? 'text-amber-400' : 'text-slate-100'}>
                        {tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toLocaleDateString() : 'Sin fecha'}
                      </strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-slate-500" />
                      <span>Entregas: <strong className="text-emerald-400">{tarea._count.entregas}</strong></span>
                    </div>
                  </div>

                  <Link 
                    href={role === 'alumno' ? `/dashboard/aula/tareas/${tarea.id}` : `/dashboard/aula/entregas/${tarea.id}`}
                    className="w-full mt-5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors group"
                  >
                    {role === 'alumno' ? 'Subir Tarea' : 'Ver Entregas'}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'avisos' && (
        <div className="py-12 text-center animate-in fade-in duration-500">
          <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white">Módulo de Avisos</h3>
          <p className="text-slate-400 mt-2">Próximamente: Comunícate directamente con tus grupos.</p>
        </div>
      )}
    </div>
  );
}
