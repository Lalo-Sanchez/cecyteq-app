import React from 'react';
import { prisma } from '@/lib/prisma';
import { Briefcase, UserPlus, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ListaDocentesPage() {
  const docentes = await prisma.docente.findMany({
    include: {
      usuario: true,
      grupos: {
        include: {
          grupo: true
        }
      }
    },
    orderBy: {
      apellidos: 'asc'
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-emerald-500" /> Plantilla Docente
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gestión de profesores, asignaciones y accesos al sistema.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/docentes/docentes/nuevo" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <UserPlus size={18} /> Nuevo Docente
          </Link>
        </div>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar docente por nombre o número de empleado..." 
          disabled
          className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-600 opacity-50 cursor-not-allowed"
        />
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">No. Empleado</th>
                <th className="px-6 py-4 font-medium">Docente</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Acceso al Sistema</th>
                <th className="px-6 py-4 font-medium">Grupos Asignados</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {docentes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay docentes registrados en la plataforma.
                  </td>
                </tr>
              ) : (
                docentes.map((docente) => (
                  <tr key={docente.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">{docente.numeroEmpleado}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{docente.nombres}</div>
                      <div className="text-xs text-slate-500">{docente.apellidos}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{docente.telefono || 'Sin teléfono'}</div>
                      <div className="text-xs text-slate-500">{docente.usuario?.email || 'Sin correo asociado'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {docente.usuario ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          Cuenta Activa
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
                          Sin Cuenta
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {docente.grupos.length > 0 ? docente.grupos.map(g => (
                          <span key={g.id} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300" title={g.materia}>
                            {g.grupo.nombre}
                          </span>
                        )) : (
                          <span className="text-slate-500 italic text-xs">Ninguno</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
