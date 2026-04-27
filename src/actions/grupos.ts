"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearGrupo(data: { nombre: string; turno: string; generacionId?: number }) {
  try {
    const grupo = await prisma.grupo.create({
      data: {
        nombre: data.nombre,
        turno: data.turno,
        generacionId: data.generacionId || null,
      },
    });
    revalidatePath("/dashboard/docentes/grupos");
    return { success: true, grupo };
  } catch (error: any) {
    console.error("Error al crear grupo:", error);
    return { success: false, error: error.message };
  }
}

export async function asignarDocenteMateria(data: { grupoId: number; docenteId: number; materiaId: number }) {
  try {
    const asignacion = await prisma.grupoDocente.create({
      data: {
        grupoId: data.grupoId,
        docenteId: data.docenteId,
        materiaId: data.materiaId,
      },
    });
    revalidatePath(`/dashboard/docentes/grupos/${data.grupoId}`);
    return { success: true, asignacion };
  } catch (error: any) {
    console.error("Error al asignar docente a materia:", error);
    return { success: false, error: error.message };
  }
}

export async function eliminarAsignacionMateria(grupoDocenteId: number) {
  try {
    const asignacion = await prisma.grupoDocente.delete({
      where: { id: grupoDocenteId },
    });
    revalidatePath(`/dashboard/docentes/grupos/${asignacion.grupoId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar asignación:", error);
    return { success: false, error: error.message };
  }
}

export async function guardarHorario(data: {
  grupoDocenteId: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}) {
  try {
    const horario = await prisma.horario.create({
      data: {
        grupoDocenteId: data.grupoDocenteId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
      },
    });
    const asignacion = await prisma.grupoDocente.findUnique({ where: { id: data.grupoDocenteId } });
    if (asignacion) {
      revalidatePath(`/dashboard/docentes/grupos/${asignacion.grupoId}`);
    }
    return { success: true, horario };
  } catch (error: any) {
    console.error("Error al guardar horario:", error);
    return { success: false, error: error.message };
  }
}

export async function eliminarHorario(horarioId: number) {
  try {
    const horario = await prisma.horario.delete({
      where: { id: horarioId },
      include: { grupoDocente: true }
    });
    revalidatePath(`/dashboard/docentes/grupos/${horario.grupoDocente.grupoId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar horario:", error);
    return { success: false, error: error.message };
  }
}
