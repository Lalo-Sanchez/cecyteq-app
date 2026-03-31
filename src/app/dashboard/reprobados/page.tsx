"use client";

import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function ReprobadosPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-300">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-300/80">Sección de Reprobados</p>
            <h1 className="text-3xl font-semibold text-white">Reprobados</h1>
          </div>
        </div>
        <p className="mt-4 text-slate-400">Página creada para mostrar los alumnos reprobados por grupo y materia, con información clave para seguimiento y recuperación.</p>
      </div>

      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow">
        <h2 className="text-xl font-semibold text-white">Pendiente</h2>
        <p className="mt-3 text-slate-400">Aquí se integrarán las tablas y filtros de reprobados, listas por grupo y detalles por alumno.</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/dashboard" className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Volver al dashboard</Link>
          <Link href="/dashboard/calificaciones" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">Ir a Calificaciones</Link>
        </div>
      </div>
    </div>
  );
}
