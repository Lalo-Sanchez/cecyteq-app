"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registrarAcceso(docenteId: number, tipo: 'Entrada' | 'Salida') {
  try {
    const bitacora = await prisma.bitacoraAcceso.create({
      data: {
        docenteId,
        tipo
      }
    });

    revalidatePath("/dashboard/docentes/bitacoras");
    return { success: true, bitacora };
  } catch (error: any) {
    console.error("Error al registrar bitácora:", error);
    return { success: false, error: error.message };
  }
}

export async function getBitacorasDocente(docenteId: number) {
  try {
    const bitacoras = await prisma.bitacoraAcceso.findMany({
      where: { docenteId },
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    return { success: true, bitacoras };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
