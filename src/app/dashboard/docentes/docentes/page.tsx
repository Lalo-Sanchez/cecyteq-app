"use client";

import React from 'react';

export default function DocentesListPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Docentes</p>
          <h1 className="text-3xl font-semibold text-white">Listado de Docentes</h1>
        </div>
        <p className="mt-4 text-slate-400">La tabla de docentes mostrará su materia, correo y los grupos que atienden.</p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Materia</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Grupo asignado</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr className="hover:bg-slate-900/50">
              <td className="px-4 py-3 text-white">María Sánchez</td>
              <td className="px-4 py-3">Matemáticas</td>
              <td className="px-4 py-3">m.sanchez@example.com</td>
              <td className="px-4 py-3">4A</td>
              <td className="px-4 py-3">55-1234-5678</td>
              <td className="px-4 py-3 text-emerald-300">Activo</td>
            </tr>
            <tr className="hover:bg-slate-900/50">
              <td className="px-4 py-3 text-white">Juan López</td>
              <td className="px-4 py-3">Física</td>
              <td className="px-4 py-3">j.lopez@example.com</td>
              <td className="px-4 py-3">3B</td>
              <td className="px-4 py-3">55-9876-5432</td>
              <td className="px-4 py-3 text-emerald-300">Activo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
