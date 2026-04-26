import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matricula = searchParams.get('matricula');

    if (!matricula) {
      return NextResponse.json({ error: 'matricula requerida' }, { status: 400 });
    }

    const calificaciones = await prisma.calificacion.findMany({
      where: { alumno: { matricula } },
      select: {
        id: true,
        materia: true,
        parcial1: true,
        parcial2: true,
        parcial3: true,
        final: true,
      },
      orderBy: { materia: 'asc' }
    });

    return NextResponse.json(calificaciones);
  } catch (error: any) {
    console.error("Error en GET /api/calificaciones:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
