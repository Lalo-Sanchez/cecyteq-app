import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const seedLista = [
  { nombres: 'Lalo', apellidoPaterno: 'Sanchez', apellidoMaterno: 'Gomez', turno: 'Matutino', grupo: '6TPROG-AM' },
  { nombres: 'Lalo', apellidoPaterno: 'Zapata', apellidoMaterno: 'Lopez', turno: 'Matutino', grupo: '6TPROG-AM' },
  { nombres: 'Lalo', apellidoPaterno: 'Diaz', apellidoMaterno: 'Martinez', turno: 'Matutino', grupo: '6TPROG-AM' },
];

const MATRICULA_BASE = BigInt('23422070050218');

const calcularMatriculaSiguiente = async () => {
  const maxAlumno = await prisma.alumno.findFirst({
    orderBy: { matricula: 'desc' },
  });
  if (!maxAlumno) return MATRICULA_BASE + BigInt(1);
  return BigInt(maxAlumno.matricula) + BigInt(1);
};

const obtenerCorreo = (nombres: string, apellidoPaterno: string) => {
  const p = nombres.trim().split(' ')[0]?.toLowerCase() || '';
  const a = apellidoPaterno.trim().split(' ')[0]?.toLowerCase() || '';
  return `${p}${a}@cecyteq.edu.mx`;
};

const obtenerCorreoUnico = async (nombres: string, apellidoPaterno: string, idExcluir?: number) => {
  const base = `${nombres.trim().split(' ')[0]?.toLowerCase() || ''}${apellidoPaterno.trim().split(' ')[0]?.toLowerCase() || ''}`;
  let correo = `${base}@cecyteq.edu.mx`;
  let contador = 1;

  while (await prisma.alumno.findFirst({ where: idExcluir ? { correo, NOT: { id: idExcluir } } : { correo } })) {
    correo = `${base}${contador}@cecyteq.edu.mx`;
    contador += 1;
  }

  return correo;
};

const obtenerNumeroLista = async (grupo: string, idExcluir?: number, apellidoPaternoOverride?: string) => {
  const alumnosGrupo = await prisma.alumno.findMany({
    where: idExcluir ? { grupo, NOT: { id: idExcluir } } : { grupo },
    orderBy: { apellidoPaterno: 'asc' },
  });

  const apellidosList = alumnosGrupo.map((a) => a.apellidoPaterno);
  if (!apellidoPaternoOverride) return alumnosGrupo.length + 1;

  const index = [...apellidosList, apellidoPaternoOverride]
    .sort((a, b) => a.localeCompare(b))
    .indexOf(apellidoPaternoOverride);

  return index + 1;
};

export async function GET() {
  const count = await prisma.alumno.count();
  if (count === 0) {
    let matricula = await calcularMatriculaSiguiente();
    for (const item of seedLista) {
      await prisma.alumno.create({
        data: {
          matricula: matricula.toString(),
          correo: obtenerCorreo(item.nombres, item.apellidoPaterno),
          nombres: item.nombres,
          apellidoPaterno: item.apellidoPaterno,
          apellidoMaterno: item.apellidoMaterno,
          turno: item.turno,
          grupo: item.grupo,
          numeroLista: 1,
          estatus: 'Inscrito',
          faltas: 0,
        }
      });
      matricula = matricula + BigInt(1);
    }
  }

  const alumnos = await prisma.alumno.findMany({ orderBy: { grupo: 'asc' } });
  return NextResponse.json(alumnos);
}

export async function POST(request: Request) {
  const data = await request.json();
  const matricula = await calcularMatriculaSiguiente();
  const numeroLista = await obtenerNumeroLista(data.grupo);

  const correo = await obtenerCorreoUnico(data.nombres, data.apellidoPaterno);

  const alumno = await prisma.alumno.create({
    data: {
      matricula: matricula.toString(),
      correo,
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      turno: data.turno,
      grupo: data.grupo,
      numeroLista,
      edad: parseInt(data.edad ?? '0', 10) || null,
      faltas: Number(data.faltas ?? 0),
      telefono: data.telefono,
      direccion: data.direccion,
      estatus: data.estatus,
      observaciones: data.observaciones,
      contactoEmergenciaNombre: data.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
    }
  });

  return NextResponse.json(alumno);
}

export async function PUT(request: Request) {
  const data = await request.json();
  const numLista = await obtenerNumeroLista(data.grupo, Number(data.id), data.apellidoPaterno);
  const correo = await obtenerCorreoUnico(data.nombres, data.apellidoPaterno, Number(data.id));

  const alumno = await prisma.alumno.update({
    where: { id: Number(data.id) },
    data: {
      correo,
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      turno: data.turno,
      grupo: data.grupo,
      numeroLista: numLista,
      edad: parseInt(data.edad ?? '0', 10) || null,
      faltas: Number(data.faltas ?? 0),
      telefono: data.telefono,
      direccion: data.direccion,
      estatus: data.estatus,
      observaciones: data.observaciones,
      contactoEmergenciaNombre: data.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: data.contactoEmergenciaTelefono,
    }
  });

  return NextResponse.json(alumno);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.alumno.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deletedId: id });
}
