"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function crearMateriaAccion(data: {
  nombre: string;
  descripcion?: string;
  creditos: number;
  semestre: number;
}) {
  try {
    const materia = await prisma.materiaCatalogo.create({
      data: {
        nombre: data.nombre.trim().toUpperCase(),
        descripcion: data.descripcion?.trim() || null,
        creditos: data.creditos,
        semestre: data.semestre,
      }
    });

    revalidatePath('/dashboard/docentes/materias');
    return { success: true, materia };
  } catch (error: any) {
    console.error("Error al crear materia:", error);
    return { success: false, error: error.message };
  }
}

export async function eliminarMateriaAccion(id: number) {
  try {
    await prisma.materiaCatalogo.delete({ where: { id } });
    revalidatePath('/dashboard/docentes/materias');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
