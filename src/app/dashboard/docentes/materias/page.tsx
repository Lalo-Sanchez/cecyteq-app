import React from 'react';
import { prisma } from '@/lib/prisma';
import { BookOpen, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MateriasPage() {
  // Obtener todas las asignaciones de docentes a grupos/materias
  const asignaciones = await prisma.grupoDocente.findMany({
    include: {
      docente: true,
      grupo: true
    },
    orderBy: [
      { materia: 'asc' },
      { grupo: { nombre: 'asc' } }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-orange-500" /> Catálogo de Materias Activas
          </h2>
          <p className="text-slate-400 text-sm mt-1">Directorio de materias impartidas, grupos asociados y personal docente responsable.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/docentes/materias/nuevo" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <BookOpen size={18} /> Nueva Materia
          </Link>
        </div>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar materia o docente (deshabilitado temporalmente)..." 
          disabled
          className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-600 opacity-50 cursor-not-allowed"
        />
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre de la Materia</th>
                <th className="px-6 py-4 font-medium">Grupo Asignado</th>
                <th className="px-6 py-4 font-medium">Turno</th>
                <th className="px-6 py-4 font-medium">Docente Titular</th>
                <th className="px-6 py-4 font-medium">Contacto Docente</th>
                <th className="px-6 py-4 font-medium text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {asignaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay materias asignadas a docentes en el sistema.
                  </td>
                </tr>
              ) : (
                asignaciones.map((asig) => (
                  <tr key={asig.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-orange-400">{asig.materia}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {asig.grupo.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs border border-slate-700 px-2 py-1 rounded bg-slate-800/50">
                        {asig.grupo.turno}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {asig.docente.nombres} {asig.docente.apellidos}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {asig.docente.telefono ? (
                        <span>{asig.docente.telefono}</span>
                      ) : (
                        <span className="text-slate-600 italic">No registrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Impartiéndose
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
