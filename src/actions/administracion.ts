"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsuariosAdministrativos() {
  try {
    return await prisma.usuario.findMany({
      where: {
        rol: {
          nombre: {
            in: ['admin', 'servicios_escolares']
          }
        }
      },
      include: {
        rol: true
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

export async function getRolesYPermisos() {
  try {
    const roles = await prisma.rol.findMany({
      include: {
        permisos: true
      }
    });
    const permisos = await prisma.permiso.findMany();
    return { roles, permisos };
  } catch (error) {
    console.error("Error al obtener roles y permisos:", error);
    return { roles: [], permisos: [] };
  }
}

export async function crearUsuarioAdministrativo(data: {
  email: string;
  nombreCompleto: string;
  rolId: number;
  password?: string;
}) {
  try {
    const user = await prisma.usuario.create({
      data: {
        email: data.email,
        nombreCompleto: data.nombreCompleto,
        rolId: data.rolId,
        passwordHash: data.password || '1234', // Por defecto 1234 para dev
      }
    });
    revalidatePath("/dashboard/administracion");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function togglePermisoRol(rolId: number, permisoId: number, activo: boolean) {
  try {
    if (activo) {
      await prisma.rol.update({
        where: { id: rolId },
        data: {
          permisos: {
            connect: { id: permisoId }
          }
        }
      });
    } else {
      await prisma.rol.update({
        where: { id: rolId },
        data: {
          permisos: {
            disconnect: { id: permisoId }
          }
        }
      });
    }
    revalidatePath("/dashboard/administracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function eliminarUsuario(id: number) {
  try {
    await prisma.usuario.delete({
      where: { id }
    });
    revalidatePath("/dashboard/administracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
