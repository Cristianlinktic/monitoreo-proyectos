import {
  contarAdmins, errorInterno, errorJson, requireAdmin, respuestaNoAutorizado, rolDe,
} from '@/lib/usuarios/servidor'
import { dejaSinAdmin, esRol } from '@/lib/usuarios/reglas'
import { supabaseAdmin } from '@/lib/supabase/admin'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SIN_ADMIN = 'Monitor debe conservar al menos un administrador.'

// PATCH /api/usuarios/:id — cambia el rol. Solo admin.
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return respuestaNoAutorizado(auth.status)

    const { id } = await ctx.params
    if (!UUID.test(id)) return errorJson(400, 'Usuario no válido.')

    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    const rol = body?.rol
    if (!esRol(rol)) return errorJson(400, 'Rol no válido.')

    const actual = await rolDe(id)
    if (!actual) return errorJson(404, 'Ese usuario no tiene acceso a Monitor.')
    if (dejaSinAdmin(actual, rol, await contarAdmins())) return errorJson(409, SIN_ADMIN)

    const { error } = await supabaseAdmin()
      .from('monitoreo_miembros')
      .update({ rol })
      .eq('user_id', id)
    if (error) return errorInterno('cambiar rol', error)

    return Response.json({ ok: true })
  } catch (e) {
    return errorInterno('cambiar rol', e)
  }
}

// DELETE /api/usuarios/:id — quita el acceso a Monitor. Solo borra la fila de
// monitoreo_miembros: la cuenta de auth.users es compartida con otras apps.
export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return respuestaNoAutorizado(auth.status)

    const { id } = await ctx.params
    if (!UUID.test(id)) return errorJson(400, 'Usuario no válido.')

    const actual = await rolDe(id)
    if (!actual) return errorJson(404, 'Ese usuario no tiene acceso a Monitor.')
    if (dejaSinAdmin(actual, null, await contarAdmins())) return errorJson(409, SIN_ADMIN)

    const { error } = await supabaseAdmin()
      .from('monitoreo_miembros')
      .delete()
      .eq('user_id', id)
    if (error) return errorInterno('quitar acceso', error)

    return Response.json({ ok: true })
  } catch (e) {
    return errorInterno('quitar acceso', e)
  }
}
