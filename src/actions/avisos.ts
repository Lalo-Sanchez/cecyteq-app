"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function publicarAviso(data: {
  titulo: string;
  contenido: string;
  tipo: 'General' | 'Urgente' | 'Evento';
  grupoId?: number;
}) {
  try {
    // 1. Crear el aviso (si tuviéramos un modelo Aviso, pero por ahora usaremos Notificaciones directas para todos)
    // Para simplificar, crearemos una notificación para cada usuario relevante
    
    let usuarios: { id: number }[] = [];
    
    if (data.grupoId) {
      // Notificar solo al grupo
      const alumnos = await prisma.alumno.findMany({
        where: { grupoId: data.grupoId },
        select: { usuario: { select: { id: true } } }
      });
      usuarios = alumnos.map(a => a.usuario).filter(u => u !== null) as { id: number }[];
    } else {
      // Notificar a todos
      usuarios = await prisma.usuario.findMany({ select: { id: true } });
    }

    // 2. Crear notificaciones en lote
    await prisma.notificacion.createMany({
      data: usuarios.map(u => ({
        usuarioId: u.id,
        mensaje: `[${data.tipo}] ${data.titulo}: ${data.contenido}`,
        tipo: data.tipo,
        leida: false
      }))
    });

    revalidatePath("/dashboard");
    return { success: true, count: usuarios.length };
  } catch (error: any) {
    console.error("Error al publicar aviso:", error);
    return { success: false, error: error.message };
  }
}
