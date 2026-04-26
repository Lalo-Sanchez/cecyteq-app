"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearDocente(data: {
  nombres: string;
  apellidos: string;
  email: string;
  especialidad?: string;
  telefono?: string;
}) {
  try {
    // 1. Verificar si el email ya existe en Usuario
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, error: "El correo ya está registrado." };
    }

    // 2. Obtener el rol de docente
    const role = await prisma.rol.findUnique({
      where: { nombre: 'docente' }
    });

    if (!role) {
      return { success: false, error: "Rol de docente no configurado." };
    }

    // 3. Crear Docente y Usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const docente = await tx.docente.create({
        data: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          numeroEmpleado: data.email, // Usamos el email como identificador único de empleado por ahora
          telefono: data.telefono,
        }
      });

      const usuario = await tx.usuario.create({
        data: {
          email: data.email,
          passwordHash: '1234', // Contraseña temporal
          nombreCompleto: `${data.nombres} ${data.apellidos}`,
          rolId: role.id,
          docenteId: docente.id,
        }
      });

      return { docente, usuario };
    });

    revalidatePath("/dashboard/docentes/docentes");
    return { success: true, docente: result.docente };
  } catch (error: any) {
    console.error("Error al crear docente:", error);
    return { success: false, error: error.message };
  }
}

export async function eliminarDocente(id: number) {
  try {
    await prisma.docente.delete({
      where: { id }
    });
    revalidatePath("/dashboard/docentes/docentes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
