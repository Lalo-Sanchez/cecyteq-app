import React from 'react';
import { prisma } from '@/lib/prisma';
import { AlertTriangle } from 'lucide-react';
import ReprobadosClient from './ReprobadosClient';

export const dynamic = 'force-dynamic';

export default async function ReprobadosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await searchParams;
  const grupoId = typeof resolvedParams.grupo === 'string' ? resolvedParams.grupo : '';

  // 1. Obtener lista de todos los grupos para el selector
  const grupos = await prisma.grupo.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' }
  });

  // 2. Filtro dinámico: Si hay grupo, filtramos, si no, traemos TODOS los reprobados globales
  // En el caso de reprobados, 1700 alumnos * 0.1 (tasa reprobatoria) = 170 records, lo cual sí es rápido cargar de forma global
  const whereClause: any = {
    final: { lt: 6.0 }
  };
  
  if (grupoId) {
    whereClause.alumno = { grupoId: Number(grupoId) };
  }

  const reprobados = await prisma.calificacion.findMany({
    where: whereClause,
    select: {
      id: true,
      materia: true,
      parcial1: true,
      parcial2: true,
      parcial3: true,
      final: true,
      alumno: {
        select: {
          matricula: true,
          nombres: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          numeroLista: true,
          faltas: true,       // necesario para calcular asistencia
        }
      }
    },
    orderBy: [
      { alumno: { apellidoPaterno: 'asc' } },
      { materia: 'asc' }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Control de Reprobados e Irregulares
          </h2>
          <p className="text-slate-400 text-sm mt-1">Alumnos con evaluación final no aprobatoria.</p>
        </div>
      </div>

      <ReprobadosClient 
        grupos={grupos} 
        reprobados={reprobados} 
        selectedGrupoId={grupoId}
        totalReprobadosCount={reprobados.length}
      />
    </div>
  );
}
