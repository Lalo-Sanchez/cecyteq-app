"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotificaciones(usuarioId: number) {
  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
      take: 10
    });
    return { success: true, notificaciones };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function marcarComoLeida(id: number) {
  try {
    await prisma.notificacion.update({
      where: { id },
      data: { leida: true }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function crearNotificacion(data: {
  usuarioId: number;
  mensaje: string;
  tipo: string;
}) {
  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        usuarioId: data.usuarioId,
        mensaje: data.mensaje,
        tipo: data.tipo,
        leida: false
      }
    });
    revalidatePath("/dashboard");
    return { success: true, notificacion };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
