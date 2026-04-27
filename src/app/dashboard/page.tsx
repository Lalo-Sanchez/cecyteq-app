"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle, BookOpen, Clock, Award, Bell } from 'lucide-react';
import { obtenerEstadisticasDashboard } from '@/actions/dashboard';

type AlumnoResumen = {
  id: number;
  estatus: string;
  faltas: number;
};

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoResumen[]>([]);
  const [serviciosAbiertos, setServiciosAbiertos] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole'));
    }
  }, []);

  useEffect(() => {
    if (role === 'admin') {
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
    } else if (role === 'alumno' || role === 'docente') {
      const loadStats = async () => {
        const result = await obtenerEstadisticasDashboard();
        if (result.success) setStats(result.data);
      };
      loadStats();
    }
  }, [role]);

  const alumnosActivos = useMemo(() => alumnos.filter((al) => al.estatus === 'Inscrito').length, [alumnos]);
  const faltasTotales = useMemo(() => alumnos.reduce((sum, al) => sum + (al.faltas || 0), 0), [alumnos]);
  const alumnosRiesgo = useMemo(() => alumnos.filter((al) => al.faltas >= 3).length, [alumnos]);

  if (role === 'admin') {
    return (
      <div className="space-y-8 animate-fadeInUp">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="container-frost rounded-[2rem] border border-zinc-800/50 p-8 shadow-glow transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-orange-400/80">Panel de Control</p>
                <h1 className="text-4xl font-semibold text-white">Resumen de la generación</h1>
                <p className="max-w-2xl text-slate-300">Consulta en tiempo real los alumnos activos, las faltas acumuladas y el avance de la nueva sección de servicios docentes.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Link href="/dashboard/alumnos" className="rounded-3xl border border-zinc-800/60 bg-zinc-900/70 px-4 py-4 text-center text-sm text-white transition hover:-translate-y-0.5 hover:bg-zinc-900">
                  <p className="text-slate-400">Alumnos</p>
                  <p className="mt-2 text-2xl font-semibold text-cecyteq-orange">{alumnos.length}</p>
                </Link>
                <Link href="/dashboard/tramites" className="rounded-3xl border border-zinc-800/60 bg-zinc-900/70 px-4 py-4 text-center text-sm text-white transition hover:-translate-y-0.5 hover:bg-zinc-900">
                  <p className="text-zinc-400">Trámites</p>
                  <p className="mt-2 text-2xl font-semibold text-cecyteq-green">{alumnos.length ? Math.max(0, alumnos.length - 0) : 0}</p>
                </Link>
                <Link href="/dashboard/docentes" className="rounded-3xl border border-slate-800/60 bg-slate-900/70 px-4 py-4 text-center text-sm text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
                  <p className="text-slate-400">Docentes</p>
                  <p className="mt-2 text-2xl font-semibold text-cecyteq-green">Ir</p>
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[1.75rem] border border-zinc-700/70 bg-zinc-900/80 p-6 text-white shadow-sm backdrop-blur-md transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400/70">Alumnos Activos</p>
                <p className="mt-4 text-4xl font-semibold text-white">{alumnosActivos}</p>
                <p className="mt-2 text-sm text-slate-400">Inscritos actualmente</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-700/70 bg-slate-900/80 p-6 text-white shadow-sm backdrop-blur-md transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-cecyteq-green/70">Faltas Totales</p>
                <p className="mt-4 text-4xl font-semibold text-cecyteq-green">{faltasTotales}</p>
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
                  className="rounded-full bg-cecyteq-green/15 px-4 py-2 text-xs font-semibold text-cecyteq-green ring-1 ring-cecyteq-green/20 transition hover:bg-cecyteq-green/25"
                >
                  {serviciosAbiertos ? 'Ocultar' : 'Abrir'}
                </button>
              </div>

              {serviciosAbiertos && (
                <div className="mt-5 space-y-3">
                  <Link href="/dashboard/alumnos" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Alumnos</span>
                      <CheckCircle size={18} className="text-cecyteq-green" />
                    </div>
                  </Link>
                  <Link href="/dashboard/tramites" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Trámites</span>
                      <CheckCircle size={18} className="text-cecyteq-green" />
                    </div>
                  </Link>
                  <Link href="/dashboard/calificaciones" className="block rounded-2xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-4">
                      <span>Calificaciones</span>
                      <span className="text-orange-400 text-sm font-semibold">Nueva</span>
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

            <div className="container-frost rounded-[2rem] border border-zinc-800/50 p-6 shadow-glow transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cecyteq-green/10 text-cecyteq-green">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Servicios Docentes</p>
                  <h3 className="text-xl font-semibold text-white">Gestión de Plantilla</h3>
                </div>
              </div>
              <p className="mt-4 text-zinc-300 text-sm">Administración central de docentes, asignación de materias y control de bitácoras digitales.</p>
              <Link href="/dashboard/docentes" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cecyteq-green to-cecyteq-green/80 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                Ir a Servicios Docentes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista para Alumno / Docente
  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-800/60 bg-zinc-950/90 p-10 shadow-glow">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,100,33,0.1),transparent_25%)]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">¡Bienvenido de nuevo!</h1>
            <p className="text-zinc-400 mt-2 max-w-md">Aquí tienes un resumen de tus actividades y progreso en la plataforma.</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right bg-zinc-900 px-6 py-4 rounded-3xl border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Tu Rol Oficial</p>
                <p className="text-2xl font-black text-cecyteq-green uppercase tracking-tighter">{role || 'Usuario'}</p>
             </div>
             {stats && role === 'alumno' && (
                <div className="text-center bg-zinc-900 px-6 py-4 rounded-3xl border border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Materias</p>
                  <p className="text-2xl font-black text-white">{stats.materiasAprobadas} <span className="text-sm text-zinc-500">/ {stats.totalMaterias || 1}</span></p>
                </div>
             )}
             {stats && role === 'docente' && (
                <div className="text-center bg-zinc-900 px-6 py-4 rounded-3xl border border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Por Revisar</p>
                  <p className="text-2xl font-black text-orange-400">{stats.tareasPorRevisar} <span className="text-sm text-zinc-500">Tareas</span></p>
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/aula" className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 hover:bg-zinc-800/80 transition-all group shadow-glow relative overflow-hidden">
          <div className="w-14 h-14 bg-cecyteq-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <BookOpen className="text-cecyteq-green" size={28} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Aula Virtual</h3>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Consulta tus tareas y sube tus entregas a tiempo.</p>
        </Link>

        {role === 'alumno' ? (
          <Link href="/dashboard/perfil/kardex" className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 hover:bg-zinc-800/80 transition-all group shadow-glow relative overflow-hidden">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Award className="text-orange-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Mi Kardex</h3>
            <p className="text-zinc-500 text-sm mt-2 font-medium">Revisa tus calificaciones oficiales e historial de progreso.</p>
          </Link>
        ) : (
          <Link href="/dashboard/docentes/grupos" className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 hover:bg-zinc-800/80 transition-all group shadow-glow relative overflow-hidden">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <CheckCircle className="text-orange-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Pase de Lista</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Registra la asistencia de tus {stats?.totalGrupos || 0} grupos asignados.</p>
          </Link>
        )}

        <Link href={role === 'alumno' ? '/dashboard/horarios' : '/dashboard/perfil'} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 hover:bg-slate-800/80 transition-all group shadow-glow relative overflow-hidden">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-slate-700">
            {role === 'alumno' ? <Clock className="text-slate-300" size={28} /> : <Briefcase className="text-slate-300" size={28} />}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            {role === 'alumno' ? 'Horario Escolar' : 'Perfil Institucional'}
          </h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {role === 'alumno' ? 'Consulta tus materias y horas asignadas.' : 'Administra tu identidad y configuración personal.'}
          </p>
        </Link>
      </div>
    </div>
  );
}
