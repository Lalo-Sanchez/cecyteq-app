"use client";

import React from 'react';

export default function AvisosPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300/80">Avisos</p>
          <h1 className="text-3xl font-semibold text-white">Mensajes y Avisos</h1>
        </div>
        <p className="mt-4 text-slate-400">Aquí se publicarán los avisos dirigidos a docentes, alumnos y padres de familia.</p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Mensaje</th>
              <th className="px-4 py-3">Emisor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr className="hover:bg-slate-900/50">
              <td className="px-4 py-3 text-white">Reunión pedagógica</td>
              <td className="px-4 py-3">28/03/2026</td>
              <td className="px-4 py-3">Docente</td>
              <td className="px-4 py-3">Revisión de planeaciones y entrega de boletas.</td>
              <td className="px-4 py-3">Coordinación</td>
            </tr>
            <tr className="hover:bg-slate-900/50">
              <td className="px-4 py-3 text-white">Entrega de proyectos</td>
              <td className="px-4 py-3">30/03/2026</td>
              <td className="px-4 py-3">Alumno</td>
              <td className="px-4 py-3">Recordatorio para entregar el proyecto final de química.</td>
              <td className="px-4 py-3">Departamento</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
