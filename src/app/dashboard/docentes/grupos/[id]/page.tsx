import React from 'react';
import { prisma } from '@/lib/prisma';
import GrupoDetalleClient from './GrupoDetalleClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GrupoDetallePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const grupoId = Number(id);

  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      docenteGrupos: {
        include: {
          docente: true,
          materia: true,
          horarios: {
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      }
    }
  });

  if (!grupo) {
    return (
      <div className="p-12 text-center bg-bg-main min-h-screen">
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Grupo no encontrado</h2>
        <Link href="/dashboard/docentes/grupos" className="text-cecyteq-green hover:underline mt-4 inline-block font-bold">Volver al listado</Link>
      </div>
    );
  }

  // Obtenemos los catálogos para el formulario
  const docentes = await prisma.docente.findMany({ orderBy: { apellidos: 'asc' } });
  const materias = await prisma.materiaCatalogo.findMany({ orderBy: { nombre: 'asc' } });

  return (
    <GrupoDetalleClient 
      grupo={grupo} 
      docentes={docentes} 
      materias={materias} 
    />
  );
}
