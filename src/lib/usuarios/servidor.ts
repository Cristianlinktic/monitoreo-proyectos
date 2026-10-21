import 'server-only'

import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esRol, verificarAdmin, type ResultadoAdmin } from '@/lib/usuarios/reglas'
import type { MiembroMonitor, MonitoreoRol } from '@/lib/types'

// Al cliente solo le llegan mensajes genéricos; el detalle va a console.error.
export function errorJson(status: number, mensaje: string) {
  return Response.json({ error: mensaje }, { status })
}

export function errorInterno(contexto: string, detalle: unknown) {
  console.error(`[usuarios] ${contexto}`, detalle)
  return errorJson(500, 'No se pudo completar la operación. Intenta de nuevo.')
}

export async function requireAdmin(request: Request): Promise<ResultadoAdmin> {
  const admin = supabaseAdmin()
  return verificarAdmin(request.headers.get('authorization'), {
    async usuarioDeToken(token) {
      // getUser(token) valida el JWT contra Supabase Auth, no solo lo decodifica.
      const { data, error } = await admin.auth.getUser(token)
      if (error || !data.user) return null
      return data.user.id
    },
    rolDe,
  })
}

export function respuestaNoAutorizado(status: 401 | 403) {
  return status === 401
    ? errorJson(401, 'Tu sesión no es válida. Vuelve a iniciar sesión.')
    : errorJson(403, 'No tienes permiso para esta acción.')
}

export async function rolDe(userId: string): Promise<MonitoreoRol | null> {
  const { data, error } = await supabaseAdmin()
    .from('monitoreo_miembros')
    .select('rol')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data && esRol(data.rol) ? data.rol : null
}

export async function contarAdmins(): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from('monitoreo_miembros')
    .select('user_id', { count: 'exact', head: true })
    .eq('rol', 'admin')
  if (error) throw error
  return count ?? 0
}

export async function listarMiembros(): Promise<MiembroMonitor[]> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('monitoreo_miembros')
    .select('user_id, rol, created_at')
    .order('created_at')
  if (error) throw error

  // Los miembros son pocos: un getUserById por fila evita recorrer todo
  // auth.users, que es compartido con las otras apps.
  return Promise.all((data ?? []).map(async (m) => {
    const { data: u, error: uError } = await admin.auth.admin.getUserById(m.user_id)
    if (uError) console.error('[usuarios] getUserById', m.user_id, uError)
    return { user_id: m.user_id, email: u?.user?.email ?? null, rol: m.rol, created_at: m.created_at }
  }))
}

// La API de admin no busca por correo: se recorre auth.users por páginas.
export async function buscarUsuarioPorEmail(email: string): Promise<User | null> {
  const admin = supabaseAdmin()
  const perPage = 1000
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const encontrado = data.users.find(u => u.email?.toLowerCase() === email)
    if (encontrado) return encontrado
    if (data.users.length < perPage) return null
  }
}
