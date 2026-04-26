import React from 'react';
import { prisma } from '@/lib/prisma';
import { BookOpen, User } from 'lucide-react';
import NuevoTramiteForm from './NuevoTramiteForm';
import { redirect } from 'next/navigation';

export default async function NuevoTramitePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await searchParams;
  const matricula = typeof resolvedParams.alumno === 'string' ? resolvedParams.alumno : '';
  const tipo = typeof resolvedParams.tipo === 'string' ? resolvedParams.tipo : '';

  let alumno = null;
  if (matricula) {
    alumno = await prisma.alumno.findUnique({
      where: { matricula },
      include: {
        grupoRel: true
      }
    });
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl animate-fadeInUp rounded-[2rem] border border-slate-800/60 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800/50 bg-slate-950/95 p-8 shadow-[0_25px_90px_rgba(14,165,233,0.10)] mb-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_18%)] opacity-80" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Gestión de Regularización</p>
            <h2 className="text-3xl font-semibold text-white flex items-center gap-3 mt-2">
              <BookOpen className="text-cyan-400" /> Nuevo Trámite
            </h2>
            <p className="mt-3 text-slate-300">Completa la solicitud para iniciar el proceso de regularización académica.</p>
          </div>
        </div>

        {alumno ? (
          <NuevoTramiteForm alumno={alumno} initialTipo={tipo} />
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <User className="mx-auto text-red-500 mb-2" size={32} />
            <h3 className="text-white font-bold">Alumno no encontrado</h3>
            <p className="text-slate-400 text-sm mt-1">La matrícula "{matricula}" no corresponde a ningún alumno registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
