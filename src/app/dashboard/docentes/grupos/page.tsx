import React from 'react';
import { prisma } from '@/lib/prisma';
import { Users, Search, BookOpen } from 'lucide-react';
import CrearGrupoModal from './CrearGrupoModal';
import Link from 'next/link';

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
          docente: true,
          materia: true
        }
      }
    },
    orderBy: {
      nombre: 'asc'
    }
  });

  const generaciones = await prisma.generacion.findMany({ orderBy: { creadoEn: 'desc' } });

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-text-primary flex items-center gap-3 tracking-tight">
            <Users className="text-cecyteq-green" /> Gestión de Grupos
          </h2>
          <p className="text-text-secondary text-sm mt-1 font-medium">Administración de grupos, turnos y materias impartidas.</p>
        </div>
        <div className="flex gap-3">
          <CrearGrupoModal generaciones={generaciones} />
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-4 shadow-inner">
        <Search className="text-text-secondary" size={20} />
        <input 
          type="text" 
          placeholder="Buscar grupo por nombre o turno..." 
          disabled
          className="bg-transparent border-none outline-none text-text-primary w-full placeholder-text-secondary/40 font-bold opacity-60 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {grupos.length === 0 ? (
          <div className="col-span-full bg-bg-surface border border-border-subtle rounded-[2.5rem] p-16 text-center text-text-secondary font-medium shadow-inner">
            No hay grupos registrados en la plataforma académica.
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.id} className="group bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-glow hover:border-cecyteq-green/50 transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black text-text-primary tracking-tighter group-hover:text-cecyteq-green transition-colors">{grupo.nombre}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cecyteq-orange mt-1">{grupo.turno}</p>
                </div>
                <div className="bg-bg-main border border-border-subtle px-4 py-3 rounded-2xl text-center shadow-sm">
                  <p className="text-[9px] text-text-secondary font-black uppercase tracking-wider mb-1">Alumnos</p>
                  <p className="text-xl font-black text-cecyteq-green">{grupo._count.alumnos}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-border-subtle/50">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.15em] flex items-center gap-2">
                  <BookOpen size={14} className="text-cecyteq-green" /> Materias ({grupo.docenteGrupos.length})
                </p>
                
                <div className="space-y-2">
                  {grupo.docenteGrupos.length === 0 ? (
                    <p className="text-sm text-text-secondary italic font-medium px-2">Sin materias vinculadas.</p>
                  ) : (
                    grupo.docenteGrupos.slice(0, 3).map(dg => (
                      <div key={dg.id} className="flex justify-between items-center bg-bg-main p-3 rounded-xl border border-border-subtle/30">
                        <span className="text-xs text-text-primary font-bold truncate max-w-[130px]">{dg.materia.nombre}</span>
                        <span className="text-[9px] font-black uppercase text-text-secondary truncate max-w-[90px]" title={`${dg.docente.nombres} ${dg.docente.apellidos}`}>
                          {dg.docente.apellidos?.split(' ')[0] || dg.docente.nombres.split(' ')[0]}
                        </span>
                      </div>
                    ))
                  )}
                  {grupo.docenteGrupos.length > 3 && (
                    <p className="text-[10px] text-cecyteq-orange font-black text-center pt-2 uppercase tracking-widest">+ {grupo.docenteGrupos.length - 3} adicionales</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <Link href={`/dashboard/docentes/grupos/${grupo.id}`} className="flex-1 text-center bg-bg-main border border-border-subtle hover:bg-bg-surface text-text-primary py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Ver y Editar Detalles
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
