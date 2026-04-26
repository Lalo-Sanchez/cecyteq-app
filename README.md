🎓 CECYTEQ - Plataforma Integral de Gestión Educativa

Plataforma web moderna, rápida y segura diseñada para modernizar y centralizar la administración académica, servicios escolares y aulas virtuales de la institución CECYTEQ.

👥 Equipo de Desarrollo (Lesty)

Este software ha sido diseñado, estructurado y desarrollado íntegramente por el equipo de Lesty Software Solutions:

👑 Eduardo Sánchez Vargas: Team Leader y Dirección del Proyecto.

💻 Omar Camacho Covarrubias: Developer Full Stack y Arquitectura de Software.

✨ Características Principales

🔐 Sistema de Autenticación y Roles

Login Seguro: Verificación de credenciales conectada a una base de datos real.

Control de Acceso (RBAC Dinámico): Interfaces dinámicas que se adaptan según el rol del usuario:

👑 Administración / Dirección: Acceso a métricas y control dinámico de roles administrativos.

📂 Servicios Escolares / Docentes: Gestión cruzada de expedientes, horarios y plantillas de docentes.

👨‍🏫 Docente: Gestión de aula virtual, bitácoras de acceso, pase de lista y mesa de calificación dividida.

👨‍🎓 Alumno: Visualización de kardex, horarios y aula virtual interactiva (envío de tareas).

👥 Tutor: Visualización del rendimiento del alumno y módulo de comunicación y citas.

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

Base de Datos (Desarrollo y Producción): PostgreSQL.

📂 Estructura del Proyecto

El proyecto utiliza una arquitectura modular limpia para facilitar el mantenimiento:

cecyteq-app/
├── prisma/
│ └── schema.prisma # Esquema y modelos de la Base de Datos
├── src/
│ ├── actions/
│ │ └── auth.ts # Server Actions (Consultas seguras a BD)
│ ├── components/
│ │ └── layout/ # Componentes reutilizables (Sidebar, TopBar)
│ └── app/  
│ ├── page.tsx # Página principal (Inicio de Sesión)
│ └── dashboard/ # Área protegida de la plataforma
│ ├── layout.tsx # Esqueleto principal (Barras de navegación)
│ ├── page.tsx # Panel de control y métricas
│ └── alumnos/  
│ └── page.tsx # Módulo de Servicios Escolares y Formulario

🚀 Instalación y Configuración Local

Sigue estos pasos para correr el proyecto en tu máquina local:

1. Clonar el repositorio e instalar dependencias

git clone <tu-repositorio-url>
cd cecyteq-app
npm install

2. Configurar Prisma y Base de Datos

Asegúrate de tener PostgreSQL corriendo localmente, ajusta tu archivo `.env` con la cadena de conexión correspondiente, y sincroniza el esquema:

npx prisma migrate dev --name init

Generar el cliente de Prisma para que TypeScript lo reconozca:

npx prisma generate

3. Iniciar el servidor de desarrollo

npm run dev

Abre http://localhost:3000 en tu navegador para ver la plataforma en funcionamiento.

🚧 Plan de Implementación (Cronograma de Desarrollo)

### Fase 1: Estructuración y Autenticación

- **Setup del Proyecto:** Configuración de Next.js, Tailwind CSS v4, Prisma y **PostgreSQL**.
- **Desarrollo:** Implementación del Control de Acceso Basado en Roles (RBAC Dinámico) con permisos granulares para Directores, Servicios Escolares/Docentes, Docentes, Alumnos y Tutores.
- **UI:** Maquetación del layout principal (Mobile-First) con soporte para modo oscuro.

### Fase 2: Administración Escolar

- **Desarrollo:** Construcción del directorio interactivo optimizado para **1,700 alumnos activos** (distribuidos en 3 generaciones/semestres).
- **UI/UX:** Motor de búsqueda de alto rendimiento, filtros por generación/grupo y formularios para el Expediente Digital Unificado.

### Fase 3: Gestión Docente y Evaluación

- **Desarrollo:** Módulo "Asistencia a un Clic" (optimizado para móviles), Bitácoras de entrada/salida y "Mesa de Revisión Dividida".
- **Área Escolar (Aula Virtual):** Módulo para que los docentes asignen tareas, proyectos y avisos a sus grupos.

### Fase 4: Perfil del Alumno y Despliegue

- **Desarrollo:** Interfaz para el alumno (subir tareas, consultar horarios) y Portal para Tutores (seguimiento y comunicación).
- **Infraestructura:** Pruebas de estrés y salida a entorno de producción.

⚖️ Licencia y Derechos de Autor

© 2026 Lesty Software Solutions. Todos los derechos reservados.

Este proyecto es de código cerrado (Closed Source). La arquitectura, diseño, lógica de programación y bases de datos son propiedad intelectual exclusiva del equipo Lesty.

Queda estrictamente prohibida la copia, reproducción, distribución, modificación, comercialización o cualquier otro uso no autorizado de este código fuente y sus recursos sin el consentimiento previo, expreso y por escrito de sus creadores. Software desarrollado de manera exclusiva como propuesta tecnológica para CECYTEQ.
