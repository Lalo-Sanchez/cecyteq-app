<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Reglas Generales para Agentes de IA y Entorno de Desarrollo Profesional

## 1. Código Limpio y Documentación
- **Comentarios Mínimos y Necesarios:** Limítate estrictamente a escribir comentarios *sólo cuando sea absolutamente necesario* para explicar lógica compleja. Evita comentarios obvios o redundantes. El código debe ser autodescriptivo mediante un buen nombrado de variables y funciones.
- **Tipado Estricto:** Usa TypeScript de forma rigurosa. Prohibido el uso de `any` a menos que sea inevitable. Define interfaces y tipos para todos los contratos de datos.

## 2. Metodología: Spec-Driven Development (SDD)
- Antes de escribir lógica de aplicación, debes definir la especificación:
  - **Datos:** Modela primero en `schema.prisma`.
  - **API:** Define los contratos (Request/Response) en Route Handlers o Server Actions.
  - **UI:** Define props y estados de los componentes aislados antes de integrarlos.

## 3. Arquitectura Next.js y UI
- **Server-First:** Usa React Server Components (RSC) por defecto para mejorar el rendimiento y SEO. Usa `'use client'` de manera granular y exclusivamente donde se necesite interactividad (hooks, eventos onClick, etc.).
- **Mobile-First & Tailwind CSS:** Diseña componentes pensando primero en pantallas móviles. Usa variables y clases de Tailwind CSS v4 (con soporte para modo oscuro) en lugar de estilos en línea.

## 4. Seguridad y RBAC (Control de Acceso Basado en Roles)
- **Validación Obligatoria:** Todas las Server Actions y endpoints del API deben validar explícitamente los permisos del usuario antes de ejecutar cualquier acción a la base de datos.
- **RBAC Dinámico:** Recuerda que el área administrativa (Directores, Servicios) es dinámica. No "hardcodees" IDs de roles administrativos. Evalúa los permisos directamente.
- **Seguridad de Datos:** Nunca expongas credenciales o información sensible en el frontend o en logs.

# 🧠 Skills del Agente (Flujos de Trabajo Estándar)

Al recibir una tarea, el Agente debe aplicar automáticamente las siguientes "Skills" (habilidades estructuradas) según el contexto:

### Skill 1: Creación de Modelos de Datos (Prisma)
1. Analizar el requerimiento y proponer el modelo en `schema.prisma`.
2. Asegurar que las relaciones respeten el modelo de **RBAC Dinámico** y **Generaciones**.
3. Ejecutar la validación del esquema (`npx prisma validate`).
4. Solicitar permiso al usuario antes de ejecutar migraciones en PostgreSQL.

### Skill 2: Creación de Endpoints y Server Actions
1. **Verificar Permisos:** Iniciar la función siempre consultando si el rol del usuario (Director, Servicios Escolares, Docente, etc.) tiene acceso a esta acción.
2. **Validar Inputs:** Usar `zod` para validar los datos entrantes.
3. **Ejecutar Lógica:** Realizar la consulta a Prisma con manejo de errores (try/catch).
4. **Revalidar:** Usar `revalidatePath` para actualizar la UI en Next.js.

### Skill 3: Desarrollo de UI / Aula Virtual
1. Crear el componente como **Server Component** por defecto.
2. Aplicar clases de **Tailwind CSS v4** garantizando un diseño responsivo (*Mobile-First*).
3. Añadir soporte para **Modo Oscuro** (`dark:`) nativo.
4. Si requiere interactividad (formularios, modales), aislar la lógica interactiva en un sub-componente con `'use client'`.
