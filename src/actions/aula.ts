"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearTarea(data: {
  titulo: string;
  descripcion?: string;
  materia: string;
  fechaVencimiento?: string;
  grupoId: number;
  docenteId: number;
}) {
  try {
    const tarea = await prisma.tarea.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        materia: data.materia,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
        grupoId: data.grupoId,
        docenteId: data.docenteId,
      },
    });

    revalidatePath("/dashboard/aula");
    return { success: true, tarea };
  } catch (error: any) {
    console.error("Error al crear tarea:", error);
    return { success: false, error: error.message };
  }
}

export async function eliminarTarea(id: number) {
  try {
    await prisma.tarea.delete({ where: { id } });
    revalidatePath("/dashboard/aula");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function calificarEntrega(entregaId: number, data: {
  calificacion: number;
  retroalimentacion?: string;
}) {
  try {
    const entrega = await prisma.entregaTarea.update({
      where: { id: entregaId },
      data: {
        calificacion: data.calificacion,
        retroalimentacion: data.retroalimentacion,
      },
    });

    revalidatePath("/dashboard/aula");
    return { success: true, entrega };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function enviarEntrega(data: {
  tareaId: number;
  alumnoId: number;
  contenido?: string;
  archivoUrl?: string;
}) {
  try {
    const entrega = await prisma.entregaTarea.upsert({
      where: {
        tareaId_alumnoId: {
          tareaId: data.tareaId,
          alumnoId: data.alumnoId,
        }
      },
      update: {
        contenido: data.contenido,
        archivoUrl: data.archivoUrl,
        entregadoEn: new Date(),
      },
      create: {
        tareaId: data.tareaId,
        alumnoId: data.alumnoId,
        contenido: data.contenido,
        archivoUrl: data.archivoUrl,
      },
    });

    revalidatePath(`/dashboard/aula/tareas/${data.tareaId}`);
    return { success: true, entrega };
  } catch (error: any) {
    console.error("Error al enviar entrega:", error);
    return { success: false, error: error.message };
  }
}

