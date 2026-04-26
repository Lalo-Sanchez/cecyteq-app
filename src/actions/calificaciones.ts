"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type CalifInput = {
  id: number;
  parcial1: number | null;
  parcial2: number | null;
  parcial3: number | null;
  final: number | null;
};

export async function actualizarCalificaciones(califs: CalifInput[]): Promise<{ ok: boolean; error?: string }> {
  try {
    await Promise.all(
      califs.map(c => {
        // Siempre recalcular el final server-side si los 3 parciales están completos
        let finalVal = c.final;
        if (c.parcial1 !== null && c.parcial2 !== null && c.parcial3 !== null) {
          finalVal = Math.round(((c.parcial1 + c.parcial2 + c.parcial3) / 3) * 10) / 10;
        }
        return prisma.calificacion.update({
          where: { id: c.id },
          data: {
            parcial1: c.parcial1,
            parcial2: c.parcial2,
            parcial3: c.parcial3,
            final: finalVal,
          },
        });
      })
    );
    revalidatePath('/dashboard/calificaciones');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
