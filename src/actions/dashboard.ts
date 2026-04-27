"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function obtenerEstadisticasDashboard() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value;
  const userIdStr = cookieStore.get('userId')?.value;

  if (!role || !userIdStr) return { success: false, error: "No autenticado" };
  const userId = Number(userIdStr);

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        alumno: {
          include: {
            calificaciones: true,
            grupoRel: {
              include: { tareas: true }
            }
          }
        },
        docente: {
          include: {
            grupos: {
              include: {
                grupo: {
                  include: { alumnos: true }
                }
              }
            },
            tareas: {
              include: { entregas: true }
            }
          }
        }
      }
    });

    if (!user) return { success: false, error: "Usuario no encontrado" };

    if (role === 'alumno' && user.alumno) {
      const alumno = user.alumno;
      const materiasAprobadas = alumno.calificaciones.filter(c => (c.final || 0) >= 6).length;
      const tareasPendientes = alumno.grupoRel?.tareas.length || 0; // Simplificado

      return {
        success: true,
        data: {
          tipo: 'alumno',
          materiasAprobadas,
          totalMaterias: alumno.calificaciones.length,
          tareasTotales: tareasPendientes,
        }
      };
    }

    if (role === 'docente' && user.docente) {
      const docente = user.docente;
      const totalGrupos = docente.grupos.length;
      const totalAlumnos = docente.grupos.reduce((acc, g) => acc + g.grupo.alumnos.length, 0);
      const tareasPorRevisar = docente.tareas.reduce((acc, t) => acc + t.entregas.filter(e => e.calificacion === null).length, 0);

      return {
        success: true,
        data: {
          tipo: 'docente',
          totalGrupos,
          totalAlumnos,
          tareasPorRevisar,
        }
      };
    }

    return { success: true, data: { tipo: 'otro' } };
  } catch (error: any) {
    console.error("Error obteniendo estadísticas:", error);
    return { success: false, error: error.message };
  }
}
