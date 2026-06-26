# Monitor MKT — LinkTIC

Panel de monitoreo diario de proyectos web para el equipo de Marketing de LinkTIC.

## Acceso

URL local: `http://localhost:3000`

### Iniciar sesión
Usa tu correo y contraseña registrados en el sistema.

### Crear una cuenta nueva
1. En la pantalla de login, haz clic en **"Crear cuenta"**
2. Ingresa el código de administrador: **`linktic2026`**
3. Completa el formulario con el correo y contraseña del nuevo usuario

> El código se puede cambiar en `src/app/login/page.tsx` línea 9 (`ADMIN_CODE`).

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
