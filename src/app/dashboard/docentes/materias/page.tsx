import React from 'react';
import { prisma } from '@/lib/prisma';
import { BookOpen, Search, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MateriasPage() {
  const asignaciones = await prisma.grupoDocente.findMany({
    include: {
      docente: true,
      grupo: true,
      materia: true
    },
    orderBy: [
      { materia: { nombre: 'asc' } },
      { grupo: { nombre: 'asc' } }
    ]
  });

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-text-primary flex items-center gap-4 tracking-tighter">
            <BookOpen className="text-cecyteq-orange w-10 h-10" /> Catálogo Académico
          </h2>
          <p className="text-text-secondary text-sm mt-2 font-medium">Directorio centralizado de materias, grupos y personal docente responsable.</p>
        </div>
        <div>
          <Link href="/dashboard/docentes/materias/nuevo" className="bg-cecyteq-green hover:bg-cecyteq-green/90 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-cecyteq-green/20 flex items-center gap-2 hover:scale-[1.02]">
            <Plus size={20} /> Nueva Materia
          </Link>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 flex items-center gap-4 shadow-inner">
        <Search className="text-text-secondary" size={20} />
        <input 
          type="text" 
          placeholder="Filtrar por materia, docente o grupo..." 
          disabled
          className="bg-transparent border-none outline-none text-text-primary w-full placeholder-text-secondary/30 font-bold opacity-50 cursor-not-allowed"
        />
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 border-b border-border-subtle text-text-secondary">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Asignatura</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Grupo</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Turno</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Docente</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {asignaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-text-secondary font-medium italic">
                    No se han registrado asignaciones académicas en el periodo actual.
                  </td>
                </tr>
              ) : (
                asignaciones.map((asig) => (
                  <tr key={asig.id} className="group hover:bg-bg-main/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-black text-cecyteq-green tracking-tight text-base group-hover:text-cecyteq-orange transition-colors uppercase">{asig.materia.nombre}</span>
                    </td>
                    <td className="px-8 py-5 font-bold text-text-primary">
                      {asig.grupo.nombre}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-bg-main px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary">
                        {asig.grupo.turno}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold">
                      {asig.docente.nombres} {asig.docente.apellidos}
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-text-secondary">
                      {asig.docente.telefono || '—'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border bg-cecyteq-green/10 text-cecyteq-green border-cecyteq-green/20 shadow-sm">
                        Activo
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
