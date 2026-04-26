import React from 'react';
import { prisma } from '@/lib/prisma';
import { Award } from 'lucide-react';
import CalificacionesClient from './CalificacionesClient';

export const dynamic = 'force-dynamic';

export default async function CalificacionesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse params
  // Wait, Next.js 15+ searchParams might be a Promise. Next.js 16 it is definitively a Promise.
  // We'll await searchParams.
  const resolvedParams = await searchParams;
  const grupoId = typeof resolvedParams.grupo === 'string' ? resolvedParams.grupo : '';
  const alumnoParam = typeof resolvedParams.alumno === 'string' ? resolvedParams.alumno : '';

  // 1. Obtener lista de todos los grupos para el selector
  const grupos = await prisma.grupo.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' }
  });

  // 2. Resolver grupoId — puede venir como número (id) o como nombre del grupo
  let resolvedGrupoId = '';
  if (grupoId) {
    if (/^\d+$/.test(grupoId)) {
      // Es un ID numérico directo
      resolvedGrupoId = grupoId;
    } else {
      // Es un nombre — buscar el ID correspondiente
      const grupoEncontrado = grupos.find(
        g => g.nombre.toLowerCase() === grupoId.toLowerCase()
      );
      if (grupoEncontrado) {
        resolvedGrupoId = grupoEncontrado.id.toString();
      }
    }
  }

  // 3. Si hay un grupo seleccionado, buscar las calificaciones. Si no, mandar vacío.
  let calificaciones: any[] = [];
  
  if (resolvedGrupoId) {
    calificaciones = await prisma.calificacion.findMany({
      where: {
        alumno: {
          grupoId: Number(resolvedGrupoId)
        }
      },
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
          }
        }
      },
      orderBy: [
        { alumno: { apellidoPaterno: 'asc' } },
        { materia: 'asc' }
      ]
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="text-orange-500" /> Registro de Calificaciones
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualización y exportación por grupo (Requerido para manejar grandes volúmenes).
          </p>
        </div>
      </div>

      <CalificacionesClient 
        grupos={grupos} 
        calificaciones={calificaciones} 
        selectedGrupoId={resolvedGrupoId}
        autoExpandMatricula={alumnoParam}
      />
    </div>
  );
}
