import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import AulaClient from './AulaClient';
import { GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AulaPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value || 'admin';

  // 1. Obtener datos del usuario actual (Simulado para dev)
  // En producción esto vendría del token de sesión
  let userContext = {
    id: 0,
    role: role,
    docenteId: 0,
    alumnoId: 0,
    nombre: 'Usuario'
  };

  // Buscamos un usuario que coincida con el rol para tener datos reales
  const mockUser = await prisma.usuario.findFirst({
    where: { rol: { nombre: role } },
    include: { rol: true }
  });

  if (mockUser) {
    userContext.id = mockUser.id;
    userContext.docenteId = mockUser.docenteId || 0;
    userContext.alumnoId = mockUser.alumnoId || 0;
    userContext.nombre = mockUser.nombreCompleto;
  }

  // 2. Fetch de Tareas
  let whereClause: any = {};
  if (role === 'docente' && userContext.docenteId) {
    whereClause.docenteId = userContext.docenteId;
  } else if (role === 'alumno' && userContext.alumnoId) {
    // Para alumnos, mostrar tareas de su grupo
    const alu = await prisma.alumno.findUnique({
      where: { id: userContext.alumnoId },
      select: { grupoId: true }
    });
    if (alu?.grupoId) {
      whereClause.grupoId = alu.grupoId;
    }
  }

  const tareas = await prisma.tarea.findMany({
    where: whereClause,
    include: {
      grupo: { select: { nombre: true } },
      _count: { select: { entregas: true } }
    },
    orderBy: { creadoEn: 'desc' }
  });

  // 3. Fetch de Grupos (para el selector de nueva tarea)
  let grupos: { id: number; nombre: string }[] = [];
  if (role === 'admin' || role === 'servicios_escolares') {
    grupos = await prisma.grupo.findMany({ select: { id: true, nombre: true } });
  } else if (role === 'docente' && userContext.docenteId) {
    const docenteGrupos = await prisma.grupoDocente.findMany({
      where: { docenteId: userContext.docenteId },
      include: { grupo: { select: { id: true, nombre: true } } }
    });
    // Deduplicar grupos si el docente tiene varias materias en el mismo grupo
    const seen = new Set();
    grupos = docenteGrupos
      .map(dg => dg.grupo)
      .filter(g => {
        const val = seen.has(g.id);
        seen.add(g.id);
        return !val;
      });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <GraduationCap className="text-emerald-400" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Aula Virtual</h2>
            <p className="text-slate-400 text-sm mt-1">Centro de gestión académica y seguimiento de actividades.</p>
          </div>
        </div>
        
        {role === 'docente' && (
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">
            Sesión iniciada como: <strong className="text-orange-400">{userContext.nombre}</strong>
          </div>
        )}
      </div>

      <AulaClient 
        role={role} 
        tareas={tareas} 
        grupos={grupos} 
        docenteId={userContext.docenteId} 
      />
    </div>
  );
}
