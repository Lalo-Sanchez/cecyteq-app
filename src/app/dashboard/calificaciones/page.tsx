"use client";

import React from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';

export default function CalificacionesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
            <Award size={28} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Sección de Calificaciones</p>
            <h1 className="text-3xl font-semibold text-white">Calificaciones</h1>
          </div>
        </div>
        <p className="mt-4 text-slate-400">Aquí se mostrará el listado de calificaciones por alumno y grupo con la información de la relación entre alumnos, cursos y evaluaciones.</p>
      </div>

      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow">
        <h2 className="text-xl font-semibold text-white">Estado actual</h2>
        <p className="mt-3 text-slate-400">Página creada. Próximamente agregaré la tabla completa de calificaciones con relaciones a alumnos y grupos.</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/dashboard" className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Volver al dashboard</Link>
          <Link href="/dashboard/reprobados" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">Ir a Reprobados</Link>
        </div>
      </div>
    </div>
  );
}
