# Monitor MKT — LinkTIC

Panel de monitoreo diario de proyectos web para el equipo de Marketing de LinkTIC.

## Acceso

URL local: `http://localhost:3000`

### Iniciar sesión
Usa tu correo y contraseña registrados en el sistema.

### Usuarios nuevos
No hay registro abierto. Un administrador de Monitor crea la cuenta (o da acceso a
una que ya exista en Supabase) desde **Usuarios** en la barra superior, y ahí mismo
cambia roles (`lector`, `editor`, `admin`) o quita el acceso.

---

## Desarrollo

```bash
npm run dev       # servidor de desarrollo en http://localhost:3000
npm run build     # build de producción
npx tsc --noEmit  # verificar tipos TypeScript
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=monitoring-images
# Solo servidor (gestión de usuarios). Nunca con prefijo NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Base de datos (Supabase)

Tablas requeridas:
- `projects` — datos fijos de cada proyecto (URL, maquetador, plugins, accesos, etc.)
- `monitoring_entries` — registro diario de monitoreo por proyecto y fecha
- `tasks` — tareas con seguimiento por proyecto
- `profiles` — perfiles de usuario vinculados a auth

SQL de configuración inicial disponible en los comentarios de `src/services/`.

## Stack

- **Next.js 16** — App Router
- **Supabase** — base de datos PostgreSQL + Storage + Auth
- **Tailwind CSS v4** — estilos
- **GSAP** — animaciones
- **Recharts** — gráficas
- **SheetJS (xlsx)** — importación/exportación de Excel
