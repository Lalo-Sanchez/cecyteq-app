"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearTramite(data: {
  alumnoId: number;
  tipo: string;
  motivo: string;
  observaciones?: string;
  estatus?: string;
  respuestaAdministrador?: string;
}) {
  try {
    const tramite = await prisma.tramite.create({
      data: {
        alumnoId: data.alumnoId,
        tipo: data.tipo,
        motivo: data.motivo,
        observaciones: data.observaciones,
        estatus: data.estatus || "Pendiente",
        respuestaAdministrador: data.respuestaAdministrador,
      },
    });

    revalidatePath("/dashboard/tramites");
    return { success: true, tramite };
  } catch (error: any) {
    console.error("Error al crear trámite:", error);
    return { success: false, error: error.message };
  }
}

export async function actualizarTramite(id: number, data: {
  estatus: string;
  respuestaAdministrador?: string;
}) {
  try {
    const tramite = await prisma.tramite.update({
      where: { id },
      data: {
        estatus: data.estatus,
        respuestaAdministrador: data.respuestaAdministrador,
      },
    });

    revalidatePath("/dashboard/tramites");
    return { success: true, tramite };
  } catch (error: any) {
    console.error("Error al actualizar trámite:", error);
    return { success: false, error: error.message };
  }
}
