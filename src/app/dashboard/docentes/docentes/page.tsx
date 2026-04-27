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
          grupo: true,
          materia: true
        }
      }
    },
    orderBy: {
      apellidos: 'asc'
    }
  });

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-text-primary flex items-center gap-4 tracking-tighter">
            <Briefcase className="text-cecyteq-green w-10 h-10" /> Plantilla Docente
          </h2>
          <p className="text-text-secondary text-sm mt-2 font-medium">Gestión integral de profesores, asignaciones académicas y accesos.</p>
        </div>
        <div>
          <Link href="/dashboard/docentes/docentes/nuevo" className="bg-cecyteq-green hover:bg-cecyteq-green/90 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-cecyteq-green/20 flex items-center gap-2 hover:scale-[1.02]">
            <UserPlus size={20} /> Registrar Docente
          </Link>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 flex items-center gap-4 shadow-inner">
        <Search className="text-text-secondary" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, apellidos o número de empleado..." 
          disabled
          className="bg-transparent border-none outline-none text-text-primary w-full placeholder-text-secondary/30 font-bold opacity-50 cursor-not-allowed"
        />
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 border-b border-border-subtle text-text-secondary">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">ID Empleado</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Nombre del Docente</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Información de Contacto</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Estatus de Acceso</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Grupos Activos</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {docentes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-text-secondary font-medium italic">
                    No se han registrado docentes en la base de datos institucional.
                  </td>
                </tr>
              ) : (
                docentes.map((docente) => (
                  <tr key={docente.id} className="group hover:bg-bg-main/50 transition-colors">
                    <td className="px-8 py-5 font-mono text-xs text-text-secondary font-bold tracking-wider">{docente.numeroEmpleado}</td>
                    <td className="px-8 py-5">
                      <div className="font-black text-text-primary uppercase tracking-tight text-base group-hover:text-cecyteq-green transition-colors">{docente.nombres}</div>
                      <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">{docente.apellidos}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold">{docente.telefono || 'Sin teléfono'}</div>
                      <div className="text-[10px] font-black text-cecyteq-orange uppercase tracking-widest mt-0.5">{docente.usuario?.email || 'Pendiente de correo'}</div>
                    </td>
                    <td className="px-8 py-5">
                      {docente.usuario ? (
                        <span className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border bg-cecyteq-green/10 text-cecyteq-green border-cecyteq-green/20 shadow-sm">
                          Habilitado
                        </span>
                      ) : (
                        <span className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border bg-bg-main text-text-secondary/40 border-border-subtle">
                          Sin Acceso
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2 flex-wrap max-w-[240px]">
                        {docente.grupos.length > 0 ? docente.grupos.map(g => (
                          <span key={g.id} className="px-3 py-1.5 bg-bg-main border border-border-subtle rounded-xl text-[9px] font-black text-text-secondary uppercase tracking-widest" title={g.materia.nombre}>
                            {g.grupo.nombre}
                          </span>
                        )) : (
                          <span className="text-text-secondary/30 italic text-[10px] font-black uppercase tracking-widest">Sin asignación</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="w-10 h-10 flex items-center justify-center bg-bg-main border border-border-subtle text-text-secondary hover:text-cecyteq-green hover:border-cecyteq-green rounded-xl transition-all shadow-sm">
                          <Edit size={16} />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-bg-main border border-border-subtle text-text-secondary hover:text-red-500 hover:border-red-500 rounded-xl transition-all shadow-sm">
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
