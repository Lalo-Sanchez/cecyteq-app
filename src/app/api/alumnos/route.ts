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

const recalcularNumerosLista = async (grupo: string) => {
  const alumnosGrupo = await prisma.alumno.findMany({
    where: { grupo },
    orderBy: { apellidoPaterno: 'asc' },
  });

  for (let i = 0; i < alumnosGrupo.length; i++) {
    await prisma.alumno.update({
      where: { id: alumnosGrupo[i].id },
      data: { numeroLista: i + 1 },
    });
  }
};

const obtenerGrupoPorNombre = async (nombre: string, turno?: string) => {
  if (!nombre) return null;
  const grupoExistente = await prisma.grupo.findUnique({
    where: { nombre },
  });

  if (grupoExistente) return grupoExistente;

  return prisma.grupo.create({
    data: {
      nombre,
      turno: turno || 'Desconocido',
      numeroMaterias: 0,
    },
  });
};

const migrarGruposExistentes = async () => {
  const count = await prisma.grupo.count();
  if (count > 0) return;

  const distinctGrupos = await prisma.alumno.findMany({
    select: { grupo: true, turno: true },
    distinct: ['grupo'],
  });

  for (const item of distinctGrupos) {
    if (!item.grupo) continue;
    const grupo = await prisma.grupo.create({
      data: {
        nombre: item.grupo,
        turno: item.turno || 'Desconocido',
        numeroMaterias: 0,
      },
    });
    await prisma.alumno.updateMany({
      where: { grupo: item.grupo },
      data: { grupoId: grupo.id },
    });
  }
};

export async function GET() {
  try {
    const count = await prisma.alumno.count();
    if (count === 0) {
      let matricula = await calcularMatriculaSiguiente();
      for (const item of seedLista) {
        const grupoDb = await obtenerGrupoPorNombre(item.grupo, item.turno);
        await prisma.alumno.create({
          data: {
            matricula: matricula.toString(),
            correo: obtenerCorreo(item.nombres, item.apellidoPaterno),
            nombres: item.nombres,
            apellidoPaterno: item.apellidoPaterno,
            apellidoMaterno: item.apellidoMaterno,
            turno: item.turno,
            grupo: item.grupo,
            grupoId: grupoDb?.id,
            numeroLista: 1,
            estatus: 'Inscrito',
            faltas: 0,
          }
        });
        matricula = matricula + BigInt(1);
      }
    }

    await migrarGruposExistentes();

    const alumnos = await prisma.alumno.findMany({
      orderBy: { grupo: 'asc' },
      include: { grupoRel: true },
    });
    return NextResponse.json(alumnos);
  } catch (error: any) {
    console.error("Error en GET /api/alumnos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const matricula = await calcularMatriculaSiguiente();
    const numeroLista = await obtenerNumeroLista(data.grupo, undefined, data.apellidoPaterno);

    const correo = await obtenerCorreoUnico(data.nombres, data.apellidoPaterno);

    const grupoDb = await obtenerGrupoPorNombre(data.grupo, data.turno);

    const alumno = await prisma.alumno.create({
      data: {
        matricula: matricula.toString(),
        correo,
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        turno: data.turno,
        grupo: data.grupo,
        grupoId: grupoDb?.id,
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

    // Recalcular números de lista del grupo para todos los alumnos
    await recalcularNumerosLista(data.grupo);

    return NextResponse.json(alumno);
  } catch (error: any) {
    console.error("Error en POST /api/alumnos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Obtener el alumno actual para saber el grupo anterior
    const alumnoActual = await prisma.alumno.findUnique({
      where: { id: Number(data.id) },
    });
    
    const numLista = await obtenerNumeroLista(data.grupo, Number(data.id), data.apellidoPaterno);
    const correo = await obtenerCorreoUnico(data.nombres, data.apellidoPaterno, Number(data.id));

    const grupoDb = await obtenerGrupoPorNombre(data.grupo, data.turno);

    const alumno = await prisma.alumno.update({
      where: { id: Number(data.id) },
      data: {
        correo,
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        turno: data.turno,
        grupo: data.grupo,
        grupoId: grupoDb?.id,
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

    // Recalcular números de lista del grupo nuevo
    await recalcularNumerosLista(data.grupo);
    
    // Si el grupo cambió, también recalcular el grupo anterior
    if (alumnoActual && alumnoActual.grupo && alumnoActual.grupo !== data.grupo) {
      await recalcularNumerosLista(alumnoActual.grupo);
    }

    return NextResponse.json(alumno);
  } catch (error: any) {
    console.error("Error en PUT /api/alumnos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.alumno.delete({ where: { id: Number(id) } });
    return NextResponse.json({ deletedId: id });
  } catch (error: any) {
    console.error("Error en DELETE /api/alumnos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
