"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function solicitarCita(data: {
  tutorId: number;
  alumnoId: number;
  motivo: string;
}) {
  try {
    const cita = await prisma.citaTutor.create({
      data: {
        tutorId: data.tutorId,
        alumnoId: data.alumnoId,
        motivo: data.motivo,
        estatus: "Pendiente",
      },
    });

    revalidatePath("/dashboard/tutor");
    return { success: true, cita };
  } catch (error: any) {
    console.error("Error al solicitar cita:", error);
    return { success: false, error: error.message };
  }
}

export async function obtenerCitasTutor(tutorId: number) {
  try {
    const citas = await prisma.citaTutor.findMany({
      where: { tutorId },
      include: {
        alumno: true,
      },
      orderBy: { creadoEn: 'desc' },
    });
    return { success: true, citas };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
