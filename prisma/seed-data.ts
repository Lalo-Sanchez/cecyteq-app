import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando inyección de datos de prueba (Alumnos, Grupos, Calificaciones)...');

  // 1. Crear Generación si no existe
  const generacion = await prisma.generacion.upsert({
    where: { nombre: '2024-2027' },
    update: {},
    create: { nombre: '2024-2027' },
  });

  // 2. Crear Grupo
  const grupo = await prisma.grupo.upsert({
    where: { nombre: '3A PROGRAMACIÓN' },
    update: {},
    create: {
      nombre: '3A PROGRAMACIÓN',
      turno: 'Matutino',
      numeroMaterias: 9,
      generacionId: generacion.id,
    },
  });

  const materias = [
    'Cálculo Diferencial',
    'Física I',
    'Ecología',
    'Inglés III',
    'Desarrollo Web',
    'Bases de Datos',
    'Ofimática',
    'Ética',
    'Tutorías'
  ];

  // 3. Crear 3 Alumnos
  const alumnosData = [
    {
      matricula: '2410001',
      correo: 'alumno1@cecyteq.edu.mx',
      nombres: 'Carlos',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'García',
      numeroLista: 1,
      esReprobado: false
    },
    {
      matricula: '2410002',
      correo: 'alumno2@cecyteq.edu.mx',
      nombres: 'María',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Hernández',
      numeroLista: 2,
      esReprobado: false
    },
    {
      matricula: '2410003',
      correo: 'alumno3@cecyteq.edu.mx',
      nombres: 'Juan',
      apellidoPaterno: 'Gómez',
      apellidoMaterno: 'Martínez',
      numeroLista: 3,
      esReprobado: true // Este reprobará
    }
  ];

  for (const a of alumnosData) {
    const alumno = await prisma.alumno.upsert({
      where: { matricula: a.matricula },
      update: {},
      create: {
        matricula: a.matricula,
        correo: a.correo,
        nombres: a.nombres,
        apellidoPaterno: a.apellidoPaterno,
        apellidoMaterno: a.apellidoMaterno,
        turno: 'Matutino',
        grupo: grupo.nombre,
        grupoId: grupo.id,
        generacionId: generacion.id,
        numeroLista: a.numeroLista,
      }
    });

    // 4. Inyectar Calificaciones (9 materias)
    for (const materia of materias) {
      // Verificar si ya existe para no duplicar
      const existe = await prisma.calificacion.findFirst({
        where: { alumnoId: alumno.id, materia }
      });

      if (!existe) {
        let p1, p2, p3, final;
        
        if (a.esReprobado && materia === 'Cálculo Diferencial') {
          // Reprueba Cálculo
          p1 = 5.0; p2 = 4.5; p3 = 5.0; final = 4.8;
        } else if (a.esReprobado && materia === 'Bases de Datos') {
          // También reprueba Base de Datos
          p1 = 6.0; p2 = 5.0; p3 = 5.0; final = 5.3;
        } else {
          // Pasa con buena calificación (entre 7.5 y 10.0)
          p1 = parseFloat((Math.random() * 2.5 + 7.5).toFixed(1));
          p2 = parseFloat((Math.random() * 2.5 + 7.5).toFixed(1));
          p3 = parseFloat((Math.random() * 2.5 + 7.5).toFixed(1));
          final = parseFloat(((p1 + p2 + p3) / 3).toFixed(1));
        }

        await prisma.calificacion.create({
          data: {
            alumnoId: alumno.id,
            materia,
            parcial1: p1,
            parcial2: p2,
            parcial3: p3,
            final: final
          }
        });
      }
    }
  }

  console.log('¡Datos inyectados con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
