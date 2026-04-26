import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seeding de la Base de Datos...');

  // 1. Crear Permisos
  const permisosData = [
    { nombre: 'gestionar_alumnos' },
    { nombre: 'gestionar_docentes' },
    { nombre: 'subir_calificaciones' },
    { nombre: 'publicar_avisos' },
    { nombre: 'crear_tareas' },
    { nombre: 'ver_bitacoras' },
    { nombre: 'gestionar_tramites' }
  ];

  for (const p of permisosData) {
    await prisma.permiso.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: p,
    });
  }
  console.log('✅ Permisos creados');

  // 2. Crear Roles con sus Permisos
  const rolesConPermisos = [
    { 
      nombre: 'admin', 
      descripcion: 'Director General con acceso total',
      permisos: ['gestionar_alumnos', 'gestionar_docentes', 'subir_calificaciones', 'publicar_avisos', 'crear_tareas', 'ver_bitacoras', 'gestionar_tramites']
    },
    { 
      nombre: 'docente', 
      descripcion: 'Profesor titular de grupo',
      permisos: ['subir_calificaciones', 'crear_tareas', 'publicar_avisos']
    },
    { 
      nombre: 'servicios_escolares', 
      descripcion: 'Personal administrativo',
      permisos: ['gestionar_alumnos', 'gestionar_tramites', 'publicar_avisos']
    },
    { 
      nombre: 'alumno', 
      descripcion: 'Estudiante con acceso a sus propios datos',
      permisos: []
    }
  ];

  for (const r of rolesConPermisos) {
    await prisma.rol.upsert({
      where: { nombre: r.nombre },
      update: {
        descripcion: r.descripcion,
        permisos: {
          set: await prisma.permiso.findMany({
            where: { nombre: { in: r.permisos } }
          })
        }
      },
      create: {
        nombre: r.nombre,
        descripcion: r.descripcion,
        permisos: {
          connect: await prisma.permiso.findMany({
            where: { nombre: { in: r.permisos } }
          }).then(ps => ps.map(p => ({ id: p.id })))
        }
      },
    });
  }
  console.log('✅ Roles y jerarquía RBAC configurada');

  // 3. Usuarios Base
  const adminRole = await prisma.rol.findUnique({ where: { nombre: 'admin' } });
  if (adminRole) {
    await prisma.usuario.upsert({
      where: { email: 'admin@cecyteq.edu.mx' },
      update: {},
      create: {
        email: 'admin@cecyteq.edu.mx',
        passwordHash: '1234',
        nombreCompleto: 'Eduardo Díaz',
        rolId: adminRole.id,
      },
    });
    console.log('✅ Usuario Administrador (Eduardo Díaz) creado');
  }

  // 4. Crear un Grupo de prueba
  const generacion = await prisma.generacion.upsert({
    where: { nombre: 'G-2024-2027' },
    update: {},
    create: { nombre: 'G-2024-2027' }
  });

  const grupo = await prisma.grupo.upsert({
    where: { nombre: '601-PROG' },
    update: {},
    create: {
      nombre: '601-PROG',
      turno: 'Matutino',
      generacionId: generacion.id
    }
  });
  console.log('✅ Grupo de prueba 601-PROG creado');

  console.log('✨ Seeding finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
