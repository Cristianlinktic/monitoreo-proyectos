import { supabase } from '@/lib/supabase/client'
import type { CrearMiembroPayload, MiembroMonitor, MonitoreoRol } from '@/lib/types'

// Gestión de usuarios: todo pasa por /api/usuarios, que verifica en el
// servidor que la sesión sea admin de Monitor. La sesión vive en localStorage,
// así que el token se manda en el encabezado Authorization.
async function llamar<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Tu sesión no es válida. Vuelve a iniciar sesión.')

  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? 'No se pudo completar la operación. Intenta de nuevo.')
  return body as T
}

export function getMiembros() {
  return llamar<{ miembros: MiembroMonitor[]; yo: string }>('/api/usuarios')
}

export function crearMiembro(payload: CrearMiembroPayload) {
  return llamar<{ user_id: string; existente: boolean }>('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function cambiarRol(userId: string, rol: MonitoreoRol) {
  return llamar<{ ok: true }>(`/api/usuarios/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ rol }),
  })
}

export function quitarAcceso(userId: string) {
  return llamar<{ ok: true }>(`/api/usuarios/${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

// Contraseña inicial aleatoria (20 caracteres, sin ambiguos como 0/O o 1/l).
export function generarPassword(largo = 20): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#%*+-?@'
  const bytes = crypto.getRandomValues(new Uint32Array(largo))
  return Array.from(bytes, b => alfabeto[b % alfabeto.length]).join('')
}
