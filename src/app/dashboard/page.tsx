"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle } from 'lucide-react';

type AlumnoResumen = {
  id: number;
  estatus: string;
  faltas: number;
};

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoResumen[]>([]);
  const [serviciosAbiertos, setServiciosAbiertos] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setRole(localStorage.getItem('userRole'));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const loadAlumnos = async () => {
      try {
        const res = await fetch('/api/alumnos');
        const data: AlumnoResumen[] = await res.json();
        setAlumnos(data);
      } catch (error) {
        console.error('Error cargando alumnos:', error);
      }
    };

    loadAlumnos();
  }, []);

  const alumnosActivos = useMemo(() => alumnos.filter((al) => al.estatus === 'Inscrito').length, [alumnos]);
  const faltasTotales = useMemo(() => alumnos.reduce((sum, al) => sum + (al.faltas || 0), 0), [alumnos]);
  const alumnosRiesgo = useMemo(() => alumnos.filter((al) => al.faltas >= 3).length, [alumnos]);

  if (role === 'admin') {
    return (
      <div className="space-y-8 animate-fadeInUp">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="container-frost rounded-[2rem] border border-slate-800/50 p-8 shadow-glow transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Panel de Control</p>
                <h1 className="text-4xl font-semibold text-white">Resumen de la generación</h1>
                <p className="max-w-2xl text-slate-300">Consulta en tiempo real los alumnos activos, las faltas acumuladas y el avance de la nueva sección de servicios docentes.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Link href="/dashboard/alumnos" className="rounded-3xl border border-slate-800/60 bg-slate-900/70 px-4 py-4 text-center text-sm text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
                  <p className="text-slate-400">Alumnos</p>
                  <p className="mt-2 text-2xl font-semibold text-cyan-300">{alumnos.length}</p>
                </Link>
                <Link href="/dashboard/tramites" className="rounded-3xl border border-slate-800/60 bg-slate-900/70 px-4 py-4 text-center text-sm text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
                  <p className="text-slate-400">Trámites</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-300">{alumnos.length ? Math.max(0, alumnos.length - 0) : 0}</p>
                </Link>
                <Link href="/dashboard/docentes" className="rounded-3xl border border-slate-800/60 bg-slate-900/70 px-4 py-4 text-center text-sm text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
                  <p className="text-slate-400">Docentes</p>
                  <p className="mt-2 text-2xl font-semibold text-blue-300">Ir</p>
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[1.75rem] border border-slate-700/70 bg-slate-900/80 p-6 text-white shadow-sm backdrop-blur-md transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Alumnos Activos</p>
                <p className="mt-4 text-4xl font-semibold text-white">{alumnosActivos}</p>
                <p className="mt-2 text-sm text-slate-400">Inscritos actualmente</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700/70 bg-slate-900/80 p-6 text-white shadow-sm backdrop-blur-md transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Faltas Totales</p>
                <p className="mt-4 text-4xl font-semibold text-emerald-300">{faltasTotales}</p>
                <p className="mt-2 text-sm text-slate-400">Sumatoria total</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700/70 bg-slate-900/80 p-6 text-white shadow-sm backdrop-blur-md transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Alumnos en Riesgo</p>
                <p className="mt-4 text-4xl font-semibold text-amber-300">{alumnosRiesgo}</p>
                <p className="mt-2 text-sm text-slate-400">Con 3+ faltas</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="container-frost rounded-[2rem] border border-slate-800/50 p-6 shadow-glow transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Servicios Escolares</p>
                  <h2 className="text-2xl font-semibold text-white">Control central</h2>
                </div>
                <button
                  onClick={() => setServiciosAbiertos((prev) => !prev)}
                  className="rounded-full bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/20 transition hover:bg-cyan-500/25"
                >
                  {serviciosAbiertos ? 'Ocultar' : 'Abrir'}
                </button>
              </div>

              {serviciosAbiertos && (
                <div className="mt-5 space-y-3">
                  <Link href="/dashboard/alumnos" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Alumnos</span>
                      <CheckCircle size={18} className="text-cyan-300" />
                    </div>
                  </Link>
                  <Link href="/dashboard/tramites" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Trámites</span>
                      <CheckCircle size={18} className="text-emerald-300" />
                    </div>
                  </Link>
                  <Link href="/dashboard/calificaciones" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Calificaciones</span>
                      <span className="text-cyan-300 text-sm font-semibold">Nueva</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/reprobados" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Reprobados</span>
                      <span className="text-rose-300 text-sm font-semibold">Nueva</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div className="container-frost rounded-[2rem] border border-slate-800/50 p-6 shadow-glow transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Servicios Docentes</p>
                  <h3 className="text-xl font-semibold text-white">En proceso de expansión</h3>
                </div>
              </div>
              <p className="mt-4 text-slate-300 text-sm">Aquí se centralizarán las funciones de gestión académica del cuerpo docente, horarios y coordinaciones.</p>
              <Link href="/dashboard/docentes" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                Ir a Servicios Docentes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <h2 className="text-3xl font-semibold text-white">Bienvenido al Panel</h2>
      <p className="text-slate-400 text-sm">Aquí tienes el resumen de tus actividades de hoy.</p>
    </div>
  );
}
