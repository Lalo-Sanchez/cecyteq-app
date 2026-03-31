"use client";

import React from 'react';

export default function GruposPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Grupos</p>
            <h1 className="text-3xl font-semibold text-white">Listado de Grupos</h1>
          </div>
        </div>
        <p className="mt-4 text-slate-400">Aquí aparecerá la tabla de grupos con relación a la información de alumnos y materias.</p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3">Materia</th>
              <th className="px-4 py-3">Docente encargado</th>
              <th className="px-4 py-3">Alumnos</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr className="hover:bg-slate-900/50">
              <td className="px-4 py-3 text-white">4A</td>
              <td className="px-4 py-3">Matutino</td>
              <td className="px-4 py-3">Matemáticas</td>
              <td className="px-4 py-3">M. Sánchez</td>
              <td className="px-4 py-3">28</td>
              <td className="px-4 py-3 text-emerald-300">Activo</td>
            </tr>
            <tr className="hover:bg-slate-900/50">
              <td className="px-4 py-3 text-white">3B</td>
              <td className="px-4 py-3">Vespertino</td>
              <td className="px-4 py-3">Física</td>
              <td className="px-4 py-3">J. López</td>
              <td className="px-4 py-3">25</td>
              <td className="px-4 py-3 text-amber-300">Pendiente</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
