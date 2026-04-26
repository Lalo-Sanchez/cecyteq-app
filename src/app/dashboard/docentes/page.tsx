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
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Servicios Docentes</p>
            <h1 className="text-4xl font-semibold text-white">Gestión de Docentes</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Administra grupos, docentes y avisos desde un único lugar. Elige la sección que quieras gestionar y comienza a trabajar con datos académicos y comunicados.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-5 py-4 text-white shadow-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-cyan-300"><Users size={20} /> <span className="font-semibold">Grupos</span></div>
              <p className="text-3xl font-bold mt-2">{totalGrupos}</p>
            </div>
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-5 py-4 text-white shadow-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-emerald-300"><Briefcase size={20} /> <span className="font-semibold">Docentes</span></div>
              <p className="text-3xl font-bold mt-2">{totalDocentes}</p>
            </div>
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-5 py-4 text-white shadow-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-indigo-300"><BookOpen size={20} /> <span className="font-semibold">Materias</span></div>
              <p className="text-3xl font-bold mt-2">{totalMaterias}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link href="/dashboard/docentes/grupos" className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 text-white shadow-glow transition hover:-translate-y-1 hover:bg-slate-900/80">
          <div className="flex items-center gap-3 text-cyan-300"><Users size={24} /></div>
          <h2 className="mt-4 text-xl font-semibold">Grupos</h2>
          <p className="mt-2 text-slate-400 text-sm">Revisa, filtra y organiza los grupos de enseñanza por grado, turno y materia.</p>
        </Link>

        <Link href="/dashboard/docentes/docentes" className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 text-white shadow-glow transition hover:-translate-y-1 hover:bg-slate-900/80">
          <div className="flex items-center gap-3 text-emerald-300"><Briefcase size={24} /></div>
          <h2 className="mt-4 text-xl font-semibold">Docentes</h2>
          <p className="mt-2 text-slate-400 text-sm">Gestiona el listado de profesores, sus materias y enlaces a los grupos que atienden.</p>
        </Link>

        <Link href="/dashboard/docentes/avisos" className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 text-white shadow-glow transition hover:-translate-y-1 hover:bg-slate-900/80">
          <div className="flex items-center gap-3 text-rose-300"><Bell size={24} /></div>
          <h2 className="mt-4 text-xl font-semibold">Avisos</h2>
          <p className="mt-2 text-slate-400 text-sm">Publica mensajes, recordatorios y comunicaciones a alumnos y docentes.</p>
        </Link>

        <Link href="/dashboard/docentes/materias" className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 text-white shadow-glow transition hover:-translate-y-1 hover:bg-slate-900/80">
          <div className="flex items-center gap-3 text-indigo-300"><BookOpen size={24} /></div>
          <h2 className="mt-4 text-xl font-semibold">Materias</h2>
          <p className="mt-2 text-slate-400 text-sm">Directorio de materias, grupos vinculados y personal titular asignado.</p>
        </Link>
      </div>
    </div>
  );
}
