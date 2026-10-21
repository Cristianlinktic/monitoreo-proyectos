import {
  buscarUsuarioPorEmail, errorInterno, errorJson, listarMiembros,
  requireAdmin, respuestaNoAutorizado, rolDe,
} from '@/lib/usuarios/servidor'
import { esRol, normalizarEmail, passwordValida, PASSWORD_MIN } from '@/lib/usuarios/reglas'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/usuarios — miembros de Monitor (correo y rol). Solo admin.
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return respuestaNoAutorizado(auth.status)

    const miembros = await listarMiembros()
    return Response.json({ miembros, yo: auth.userId })
  } catch (e) {
    return errorInterno('listar', e)
  }
}

// POST /api/usuarios — crea la cuenta y le da acceso a Monitor. Si el correo
// ya existe en auth.users (cuenta de otra app) solo se agrega a
// monitoreo_miembros y conserva su contraseña.
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return respuestaNoAutorizado(auth.status)

    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    const email = normalizarEmail(body?.email)
    const rol = body?.rol
    const password = body?.password
    if (!email) return errorJson(400, 'Correo no válido.')
    if (!esRol(rol)) return errorJson(400, 'Rol no válido.')

    const admin = supabaseAdmin()
    let userId: string
    let existente = false

    const usuario = await buscarUsuarioPorEmail(email)
    if (usuario) {
      if (await rolDe(usuario.id)) return errorJson(409, 'Ese correo ya tiene acceso a Monitor.')
      userId = usuario.id
      existente = true
    } else {
      if (!passwordValida(password)) {
        return errorJson(400, `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`)
      }
      // El registro público está deshabilitado: la cuenta se crea confirmada.
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error || !data.user) return errorInterno('createUser', error)
      userId = data.user.id
    }

    const { error } = await admin.from('monitoreo_miembros').insert({ user_id: userId, rol })
    if (error) {
      if (error.code === '23505') return errorJson(409, 'Ese correo ya tiene acceso a Monitor.')
      return errorInterno('insertar miembro', error)
    }

    return Response.json({ user_id: userId, existente }, { status: 201 })
  } catch (e) {
    return errorInterno('crear', e)
  }
}
