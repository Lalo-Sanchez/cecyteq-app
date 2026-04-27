import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { FileText, Download, Award, BookOpen, ArrowLeft, CheckCircle, AlertCircle, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KardexPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value || 'alumno';

  // 1. Obtener alumno actual (Simulado)
  const mockAlumno = await prisma.alumno.findFirst({
    where: { usuario: { rol: { nombre: 'alumno' } } },
    include: {
      grupoRel: true,
      calificaciones: {
        orderBy: { materia: 'asc' }
      }
    }
  });

  if (!mockAlumno) {
    return (
      <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-3xl">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-white">Perfil no encontrado</h2>
        <p className="text-zinc-400 mt-2">No se pudieron cargar los datos del expediente académico.</p>
      </div>
    );
  }

  const promedioGeneral = mockAlumno.calificaciones.length > 0 
    ? (mockAlumno.calificaciones.reduce((acc, curr) => acc + (curr.final || 0), 0) / mockAlumno.calificaciones.length).toFixed(1)
    : '0.0';

  const materiasAprobadas = mockAlumno.calificaciones.filter(c => (c.final || 0) >= 6).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/perfil" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kardex Académico</h1>
            <p className="text-zinc-400 text-sm mt-1">Historial oficial de calificaciones y rendimiento.</p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95">
          <Download size={18} /> Descargar Kardex Oficial
        </button>
      </div>

      {/* Resumen de Rendimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={64} className="text-orange-400" />
          </div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Promedio General</p>
          <p className="text-4xl font-black text-white">{promedioGeneral}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-cecyteq-green">
             <CheckCircle size={12} /> ALUMNO REGULAR
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={64} className="text-cecyteq-green" />
          </div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Materias Aprobadas</p>
          <p className="text-4xl font-black text-white">{materiasAprobadas}<span className="text-xl text-zinc-600 font-bold ml-1">/ {mockAlumno.calificaciones.length}</span></p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
             AVANCE: {Math.round((materiasAprobadas / (mockAlumno.calificaciones.length || 1)) * 100)}%
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 lg:col-span-2">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-orange-400">
              <User size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{mockAlumno.apellidoPaterno} {mockAlumno.apellidoMaterno} {mockAlumno.nombres}</p>
              <p className="text-xs text-zinc-400 font-mono">{mockAlumno.matricula} · {mockAlumno.grupoRel?.nombre || mockAlumno.grupo} · {mockAlumno.turno}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Calificaciones */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="text-orange-400" size={20} /> Historial de Materias
          </h3>
          <span className="text-xs text-slate-500 font-medium">Ciclo Escolar: 2024-2025</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/30 text-zinc-400 text-xs uppercase tracking-widest border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Asignatura</th>
                <th className="px-6 py-4 font-semibold text-center">P1</th>
                <th className="px-6 py-4 font-semibold text-center">P2</th>
                <th className="px-6 py-4 font-semibold text-center">P3</th>
                <th className="px-6 py-4 font-semibold text-center">Final</th>
                <th className="px-6 py-4 font-semibold text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {mockAlumno.calificaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    No hay calificaciones registradas en el historial.
                  </td>
                </tr>
              ) : (
                mockAlumno.calificaciones.map((cal) => (
                  <tr key={cal.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{cal.materia}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Componente de Formación</p>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-400 font-medium">{cal.parcial1 ?? '—'}</td>
                    <td className="px-6 py-4 text-center text-zinc-400 font-medium">{cal.parcial2 ?? '—'}</td>
                    <td className="px-6 py-4 text-center text-zinc-400 font-medium">{cal.parcial3 ?? '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-black ${(cal.final || 0) >= 6 ? 'text-cecyteq-green' : 'text-cecyteq-red'}`}>
                        {cal.final?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(cal.final || 0) >= 6 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cecyteq-green bg-cecyteq-green/10 px-2.5 py-1.5 rounded-full border border-cecyteq-green/20">
                          ACREDITADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-full border border-red-500/20">
                          NO ACREDITADA
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
