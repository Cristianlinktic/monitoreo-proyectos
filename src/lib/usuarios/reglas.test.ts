// npm test — runner nativo de Node (>= 22.18 ejecuta .ts sin compilar).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  dejaSinAdmin, esRol, normalizarEmail, passwordValida, tokenDeEncabezado,
  verificarAdmin, type VerificadorAdmin,
} from './reglas.ts'
import type { MonitoreoRol } from '../types'

function verificador(tokens: Record<string, string>, roles: Record<string, MonitoreoRol>) {
  const llamadas = { token: 0, rol: 0 }
  const v: VerificadorAdmin = {
    async usuarioDeToken(token) { llamadas.token++; return tokens[token] ?? null },
    async rolDe(userId) { llamadas.rol++; return roles[userId] ?? null },
  }
  return { v, llamadas }
}

const tokens = { 'tk-admin': 'u-admin', 'tk-editor': 'u-editor', 'tk-ajeno': 'u-ajeno' }
const roles: Record<string, MonitoreoRol> = { 'u-admin': 'admin', 'u-editor': 'editor' }

test('verificarAdmin: sin encabezado → 401 sin consultar nada', async () => {
  const { v, llamadas } = verificador(tokens, roles)
  assert.deepEqual(await verificarAdmin(null, v), { ok: false, status: 401 })
  assert.deepEqual(llamadas, { token: 0, rol: 0 })
})

test('verificarAdmin: encabezado mal formado → 401', async () => {
  const { v } = verificador(tokens, roles)
  assert.deepEqual(await verificarAdmin('tk-admin', v), { ok: false, status: 401 })
  assert.deepEqual(await verificarAdmin('Basic tk-admin', v), { ok: false, status: 401 })
  assert.deepEqual(await verificarAdmin('Bearer ', v), { ok: false, status: 401 })
})

test('verificarAdmin: token inválido → 401 sin consultar el rol', async () => {
  const { v, llamadas } = verificador(tokens, roles)
  assert.deepEqual(await verificarAdmin('Bearer falso', v), { ok: false, status: 401 })
  assert.equal(llamadas.rol, 0)
})

test('verificarAdmin: sesión sin fila en monitoreo_miembros → 403', async () => {
  const { v } = verificador(tokens, roles)
  assert.deepEqual(await verificarAdmin('Bearer tk-ajeno', v), { ok: false, status: 403 })
})

test('verificarAdmin: editor → 403', async () => {
  const { v } = verificador(tokens, roles)
  assert.deepEqual(await verificarAdmin('Bearer tk-editor', v), { ok: false, status: 403 })
})

test('verificarAdmin: admin → ok con el id que da Auth', async () => {
  const { v } = verificador(tokens, roles)
  assert.deepEqual(await verificarAdmin('Bearer tk-admin', v), { ok: true, userId: 'u-admin' })
  assert.deepEqual(await verificarAdmin('bearer tk-admin', v), { ok: true, userId: 'u-admin' })
})

test('verificarAdmin: si la base falla, el error sube (no se concede acceso)', async () => {
  const v: VerificadorAdmin = {
    async usuarioDeToken() { return 'u-admin' },
    async rolDe() { throw new Error('db caída') },
  }
  await assert.rejects(verificarAdmin('Bearer tk-admin', v), /db caída/)
})

test('tokenDeEncabezado', () => {
  assert.equal(tokenDeEncabezado('Bearer abc'), 'abc')
  assert.equal(tokenDeEncabezado(''), null)
  assert.equal(tokenDeEncabezado('Bearer'), null)
})

test('dejaSinAdmin: no se puede quitar ni degradar al último admin', () => {
  assert.equal(dejaSinAdmin('admin', 'editor', 1), true)
  assert.equal(dejaSinAdmin('admin', null, 1), true)
  assert.equal(dejaSinAdmin('admin', 'admin', 1), false)
  assert.equal(dejaSinAdmin('admin', 'lector', 2), false)
  assert.equal(dejaSinAdmin('admin', null, 2), false)
  assert.equal(dejaSinAdmin('editor', null, 1), false)
})

test('passwordValida: mínimo 12 caracteres y máximo 72 bytes', () => {
  assert.equal(passwordValida('a'.repeat(11)), false)
  assert.equal(passwordValida('a'.repeat(12)), true)
  assert.equal(passwordValida('a'.repeat(73)), false)
  assert.equal(passwordValida(undefined), false)
  assert.equal(passwordValida(123456789012), false)
})

test('normalizarEmail y esRol', () => {
  assert.equal(normalizarEmail('  Persona@LinkTIC.com '), 'persona@linktic.com')
  assert.equal(normalizarEmail('sin-arroba'), null)
  assert.equal(normalizarEmail(null), null)
  assert.equal(esRol('admin'), true)
  assert.equal(esRol('superadmin'), false)
  assert.equal(esRol(undefined), false)
})
