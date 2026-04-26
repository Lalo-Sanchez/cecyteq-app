import React from 'react';
import { prisma } from '@/lib/prisma';
import { Users, Plus, Search, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GruposPage() {
  const grupos = await prisma.grupo.findMany({
    include: {
      _count: {
        select: { alumnos: true }
      },
      generacion: true,
      docenteGrupos: {
        include: {
          docente: true
        }
      }
    },
    orderBy: {
      nombre: 'asc'
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-cyan-500" /> Gestión de Grupos
          </h2>
          <p className="text-slate-400 text-sm mt-1">Administración de grupos, turnos y materias impartidas.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Plus size={18} /> Crear Grupo
          </button>
        </div>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar grupo por nombre o turno..." 
          disabled
          className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-600 opacity-50 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grupos.length === 0 ? (
          <div className="col-span-full bg-slate-950/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            No hay grupos registrados en la plataforma.
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-glow hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{grupo.nombre}</h3>
                  <p className="text-sm text-cyan-400">{grupo.turno}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-center">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Alumnos</p>
                  <p className="text-lg font-bold text-slate-200">{grupo._count.alumnos}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={14} /> Materias ({grupo.docenteGrupos.length})
                </p>
                
                <div className="space-y-2">
                  {grupo.docenteGrupos.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No hay materias asignadas.</p>
                  ) : (
                    grupo.docenteGrupos.slice(0, 3).map(dg => (
                      <div key={dg.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-sm text-slate-300 font-medium truncate max-w-[120px]">{dg.materia}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[100px]" title={`${dg.docente.nombres} ${dg.docente.apellidos}`}>
                          {dg.docente.nombres.split(' ')[0]} {dg.docente.apellidos.split(' ')[0]}
                        </span>
                      </div>
                    ))
                  )}
                  {grupo.docenteGrupos.length > 3 && (
                    <p className="text-xs text-slate-500 text-center pt-1">+ {grupo.docenteGrupos.length - 3} materias más</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-medium transition-colors">
                  Ver Detalles
                </button>
                <button className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 py-2 rounded-lg text-xs font-medium transition-colors">
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
