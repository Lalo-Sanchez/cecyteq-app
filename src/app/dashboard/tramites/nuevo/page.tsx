import React from 'react';
import { prisma } from '@/lib/prisma';
import { BookOpen, User } from 'lucide-react';
import NuevoTramiteForm from './NuevoTramiteForm';

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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 animate-fadeInUp">
      <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-border-subtle bg-bg-surface p-8 shadow-glow">
        <div className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-bg-main p-8 shadow-inner mb-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,166,74,0.1),transparent_25%)] opacity-80" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cecyteq-green font-black mb-1">Gestión de Regularización</p>
            <h2 className="text-3xl font-black text-text-primary flex items-center gap-3 tracking-tight">
              <BookOpen className="text-cecyteq-green" /> Nuevo Trámite
            </h2>
            <p className="mt-3 text-text-secondary font-medium text-sm">Completa la solicitud para iniciar el proceso de regularización académica.</p>
          </div>
        </div>

        {alumno ? (
          <NuevoTramiteForm alumno={alumno} initialTipo={tipo} />
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center">
            <User className="mx-auto text-red-500 mb-4" size={40} />
            <h3 className="text-text-primary font-black uppercase tracking-tight">Alumno no encontrado</h3>
            <p className="text-text-secondary text-sm mt-2 font-medium">La matrícula <span className="font-bold text-red-400">"{matricula}"</span> no corresponde a ningún alumno registrado en el sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
}
