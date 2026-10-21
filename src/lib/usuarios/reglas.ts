// Reglas de la gestión de usuarios de Monitor. Sin dependencias de Next ni de
// Supabase para poder probarlas con `node --test` (ver reglas.test.ts).

import type { MonitoreoRol } from '../types'

export const ROLES: readonly MonitoreoRol[] = ['lector', 'editor', 'admin']

export const PASSWORD_MIN = 12
// bcrypt (Supabase Auth) ignora lo que pase de 72 bytes.
export const PASSWORD_MAX = 72

export function esRol(valor: unknown): valor is MonitoreoRol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor)
}

export function normalizarEmail(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const email = valor.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export function passwordValida(valor: unknown): valor is string {
  if (typeof valor !== 'string') return false
  const bytes = new TextEncoder().encode(valor).length
  return valor.length >= PASSWORD_MIN && bytes <= PASSWORD_MAX
}

// Bearer <token> del encabezado Authorization. La sesión de Supabase vive en
// localStorage, así que el cliente la manda explícitamente en cada llamada.
export function tokenDeEncabezado(authorization: string | null): string | null {
  if (!authorization) return null
  const [tipo, token] = authorization.split(' ')
  if (tipo?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export interface VerificadorAdmin {
  // id del usuario dueño del token según Supabase Auth, o null si no es válido.
  usuarioDeToken(token: string): Promise<string | null>
  // Rol en public.monitoreo_miembros, leído en la base (nunca del cliente).
  rolDe(userId: string): Promise<MonitoreoRol | null>
}

export type ResultadoAdmin =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403 }

export async function verificarAdmin(
  authorization: string | null,
  verificador: VerificadorAdmin,
): Promise<ResultadoAdmin> {
  const token = tokenDeEncabezado(authorization)
  if (!token) return { ok: false, status: 401 }

  const userId = await verificador.usuarioDeToken(token)
  if (!userId) return { ok: false, status: 401 }

  const rol = await verificador.rolDe(userId)
  if (rol !== 'admin') return { ok: false, status: 403 }

  return { ok: true, userId }
}

// true si el cambio deja a Monitor sin ningún admin. nuevoRol = null es quitar
// el acceso.
export function dejaSinAdmin(
  rolActual: MonitoreoRol,
  nuevoRol: MonitoreoRol | null,
  totalAdmins: number,
): boolean {
  return rolActual === 'admin' && nuevoRol !== 'admin' && totalAdmins <= 1
}
