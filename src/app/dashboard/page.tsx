"use client";

import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

 useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setRole(localStorage.getItem('userRole'));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  if (role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel de Control General</h2>
          <p className="text-slate-400 text-sm mt-1">Visión global de la generación activa (1,042 alumnos).</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="text-slate-400 text-sm font-medium">Alumnos Activos</h3>
            <div className="mt-2 mb-1"><span className="text-3xl font-bold text-white">1,042</span></div>
            <p className="text-xs font-medium opacity-80 text-blue-400">+12 ingresos recientes</p>
          </div>
          <div className="bg-linear-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5">
            <h3 className="text-slate-400 text-sm font-medium">Asistencia Global Hoy</h3>
            <div className="mt-2 mb-1"><span className="text-3xl font-bold text-white">94.5%</span></div>
            <p className="text-xs font-medium opacity-80 text-emerald-400">57 ausencias detectadas</p>
          </div>
          <div className="bg-linear-to-br from-red-600/20 to-red-900/10 border border-red-500/20 rounded-2xl p-5">
            <h3 className="text-slate-400 text-sm font-medium">Alertas de Riesgo</h3>
            <div className="mt-2 mb-1"><span className="text-3xl font-bold text-white">18</span></div>
            <p className="text-xs font-medium opacity-80 text-red-400">Alumnos con +3 faltas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Bienvenido al Panel</h2>
      <p className="text-slate-400 text-sm mt-1">Aquí tienes el resumen de tus actividades de hoy.</p>
    </div>
  );
}