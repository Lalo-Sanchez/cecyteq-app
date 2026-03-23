🎓 CECYTEQ - Plataforma Integral de Gestión Educativa

Plataforma web moderna, rápida y segura diseñada para modernizar y centralizar la administración académica, servicios escolares y aulas virtuales de la institución CECYTEQ.

👥 Equipo de Desarrollo (Lesty)

Este software ha sido diseñado, estructurado y desarrollado íntegramente por el equipo de Lesty Software Solutions:

👑 Eduardo Sánchez Vargas: Team Leader y Dirección del Proyecto.

💻 Omar Camacho Covarrubias: Developer Full Stack y Arquitectura de Software.

📋 Leslye Díaz Gonzalez: Product Owner y Encargada del Área Administrativa.

✨ Características Principales

🔐 Sistema de Autenticación y Roles

Login Seguro: Verificación de credenciales conectada a una base de datos real.

Control de Acceso (RBAC): Interfaces dinámicas que se adaptan según el rol del usuario:

👑 Administración / Dirección: Acceso total a métricas, servicios escolares y docentes.

👨‍🏫 Docente: Gestión de aula virtual y pase de lista.

👨‍🎓 Alumno: Visualización de kardex, boletas y aula virtual.

📊 Panel de Control (Dashboard)

Visión global de la generación activa.

Métricas en tiempo real: Alumnos activos, porcentaje de asistencia global y alertas de riesgo (ausentismo).

📁 Servicios Escolares (Módulo de Alumnos)

Directorio Interactivo: Tabla con búsqueda en tiempo real (por nombre, apellido, matrícula o grupo) y ordenamiento alfabético automático.

Expediente Digital Completo: Formulario intuitivo para registrar alumnos con:

Datos académicos (Matrícula de 14 dígitos, Estatus: Inscrito/Baja/Egresado).

Nomenclatura oficial de grupos (Ej. 6TPROG-AM, 6AMBI-AM).

Observaciones médicas (Enfermedades, alergias, discapacidad).

Datos familiares (Información detallada de Tutor 1 y Tutor 2 con ocupación).

Contacto de Emergencia Dinámico: Permite asignar la emergencia al Tutor 1, Tutor 2, o desplegar un formulario adicional para un tercer contacto (ej. Tío, Abuela) especificando el parentesco.

📱 Diseño UI/UX

Interfaz moderna en Modo Oscuro (Dark Mode).

Menús laterales plegables (Acordeón) para sub-módulos (Ej. Servicios Escolares > Alumnos / Grupos).

Diseño 100% responsivo (Mobile-first).

🛠️ Stack Tecnológico

Frontend: Next.js (App Router), React, TypeScript.

Estilos: Tailwind CSS.

Íconos: Lucide React.

Backend: Next.js Server Actions (Rutas API integradas y seguras).

Base de Datos / ORM: Prisma ORM.

Base de Datos (Desarrollo): SQLite.

📂 Estructura del Proyecto

El proyecto utiliza una arquitectura modular limpia para facilitar el mantenimiento:

cecyteq-app/
├── prisma/
│   └── schema.prisma        # Esquema y modelos de la Base de Datos
├── src/
│   ├── actions/
│   │   └── auth.ts          # Server Actions (Consultas seguras a BD)
│   ├── components/
│   │   └── layout/          # Componentes reutilizables (Sidebar, TopBar)
│   └── app/                 
│       ├── page.tsx         # Página principal (Inicio de Sesión)
│       └── dashboard/       # Área protegida de la plataforma
│           ├── layout.tsx   # Esqueleto principal (Barras de navegación)
│           ├── page.tsx     # Panel de control y métricas
│           └── alumnos/     
│               └── page.tsx # Módulo de Servicios Escolares y Formulario


🚀 Instalación y Configuración Local

Sigue estos pasos para correr el proyecto en tu máquina local:

1. Clonar el repositorio e instalar dependencias

git clone <tu-repositorio-url>
cd cecyteq-app
npm install


2. Configurar Prisma y Base de Datos

Generar el archivo SQLite y sincronizar el esquema de la base de datos:

npx prisma db push


Generar el cliente de Prisma para que TypeScript lo reconozca:

npx prisma generate


3. Crear datos de prueba (Mocks)

Abre el panel visual de la base de datos:

npx prisma studio


En el panel de Chrome, agrega un usuario en la tabla Usuario con el correo admin@cecyteq.edu.mx y el rol admin para poder iniciar sesión.

4. Iniciar el servidor de desarrollo

npm run dev


Abre http://localhost:3000 en tu navegador para ver la plataforma en funcionamiento.

🚧 Próximos Pasos (Roadmap)

[ ] Encriptación de contraseñas con bcrypt.

[ ] Módulo completo de asignación de Grupos y Horarios.

[ ] Módulo de Trámites (Generación de PDF para Constancias de Estudio).

[ ] Funcionalidad de integración con cuentas de Google y Apple.

⚖️ Licencia y Derechos de Autor

© 2026 Lesty Software Solutions. Todos los derechos reservados.

Este proyecto es de código cerrado (Closed Source). La arquitectura, diseño, lógica de programación y bases de datos son propiedad intelectual exclusiva del equipo Lesty.

Queda estrictamente prohibida la copia, reproducción, distribución, modificación, comercialización o cualquier otro uso no autorizado de este código fuente y sus recursos sin el consentimiento previo, expreso y por escrito de sus creadores. Software desarrollado de manera exclusiva como propuesta tecnológica para CECYTEQ.