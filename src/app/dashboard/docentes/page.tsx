import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Briefcase, Users, Bell, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DocentesPage() {
  const [totalGrupos, totalDocentes, totalMaterias] = await Promise.all([
    prisma.grupo.count(),
    prisma.docente.count(),
    prisma.materiaCatalogo.count()
  ]);

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="rounded-[2rem] border border-border-subtle bg-bg-surface p-8 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cecyteq-green font-black mb-1">Servicios Docentes</p>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Gestión Académica</h1>
            <p className="mt-3 max-w-2xl text-text-secondary font-medium">Administra grupos, docentes y avisos desde un único lugar. Elige la sección que quieras gestionar y comienza a trabajar con datos académicos y comunicados.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-border-subtle bg-bg-main px-5 py-4 text-text-primary shadow-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-cecyteq-green"><Users size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Grupos</span></div>
              <p className="text-3xl font-black mt-2 tracking-tighter">{totalGrupos}</p>
            </div>
            <div className="rounded-3xl border border-border-subtle bg-bg-main px-5 py-4 text-text-primary shadow-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-cecyteq-orange"><Briefcase size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Docentes</span></div>
              <p className="text-3xl font-black mt-2 tracking-tighter">{totalDocentes}</p>
            </div>
            <div className="rounded-3xl border border-border-subtle bg-bg-main px-5 py-4 text-text-primary shadow-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-cecyteq-green"><BookOpen size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Materias</span></div>
              <p className="text-3xl font-black mt-2 tracking-tighter">{totalMaterias}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <Link href="/dashboard/docentes/grupos" className="group rounded-[1.75rem] border border-border-subtle bg-bg-surface/50 p-8 text-text-primary shadow-glow transition hover:-translate-y-1 hover:border-cecyteq-green/50">
          <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center text-cecyteq-green group-hover:scale-110 transition-transform"><Users size={24} /></div>
          <h2 className="mt-6 text-xl font-black tracking-tight uppercase">Grupos</h2>
          <p className="mt-2 text-text-secondary text-sm font-medium">Revisa, filtra y organiza los grupos de enseñanza por grado, turno y materia.</p>
        </Link>

        <Link href="/dashboard/docentes/docentes" className="group rounded-[1.75rem] border border-border-subtle bg-bg-surface/50 p-8 text-text-primary shadow-glow transition hover:-translate-y-1 hover:border-cecyteq-orange/50">
          <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center text-cecyteq-orange group-hover:scale-110 transition-transform"><Briefcase size={24} /></div>
          <h2 className="mt-6 text-xl font-black tracking-tight uppercase">Docentes</h2>
          <p className="mt-2 text-text-secondary text-sm font-medium">Gestiona el listado de profesores, sus materias y enlaces a los grupos que atienden.</p>
        </Link>

        <Link href="/dashboard/docentes/avisos" className="group rounded-[1.75rem] border border-border-subtle bg-bg-surface/50 p-8 text-text-primary shadow-glow transition hover:-translate-y-1 hover:border-cecyteq-green/50">
          <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center text-cecyteq-green group-hover:scale-110 transition-transform"><Bell size={24} /></div>
          <h2 className="mt-6 text-xl font-black tracking-tight uppercase">Avisos</h2>
          <p className="mt-2 text-text-secondary text-sm font-medium">Publica mensajes, recordatorios y comunicaciones a alumnos y docentes.</p>
        </Link>

        <Link href="/dashboard/docentes/materias" className="group rounded-[1.75rem] border border-border-subtle bg-bg-surface/50 p-8 text-text-primary shadow-glow transition hover:-translate-y-1 hover:border-cecyteq-orange/50">
          <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center text-cecyteq-orange group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
          <h2 className="mt-6 text-xl font-black tracking-tight uppercase">Materias</h2>
          <p className="mt-2 text-text-secondary text-sm font-medium">Directorio de materias, grupos vinculados y personal titular asignado.</p>
        </Link>
      </div>
    </div>
  );
}
