import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const tramites = await prisma.tramite.findMany({
    orderBy: { creadoEn: 'desc' },
    include: { alumno: true },
  });
  return NextResponse.json(tramites);
}

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.alumnoId || !data.tipo || !data.motivo) {
    return NextResponse.json({ error: 'alumnoId, tipo y motivo son requeridos' }, { status: 400 });
  }

  const tramite = await prisma.tramite.create({
    data: {
      alumnoId: Number(data.alumnoId),
      tipo: data.tipo,
      motivo: data.motivo,
      estatus: data.estatus ?? 'Pendiente',
      observaciones: data.observaciones ?? null,
      respuestaAdministrador: data.respuestaAdministrador ?? null,
    },
    include: { alumno: true },
  });

  return NextResponse.json(tramite, { status: 201 });
}

export async function PUT(request: Request) {
  const data = await request.json();

  if (!data.id || !data.estatus) {
    return NextResponse.json({ error: 'id y estatus son requeridos' }, { status: 400 });
  }

  const tramite = await prisma.tramite.update({
    where: { id: Number(data.id) },
    data: {
      estatus: data.estatus,
      respuestaAdministrador: data.respuestaAdministrador ?? undefined,
    },
    include: { alumno: true },
  });

  return NextResponse.json(tramite);
}
