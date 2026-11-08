import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { crearConfiguracionAdmin, leerCredenciales, verificarCredenciales } from '../src/services/adminCredentials.js'

const password = ` ${randomBytes(24).toString('hex')} `
const config = await crearConfiguracionAdmin('prueba-local', 'Cuenta aislada', password)

test('configuración guarda solo hash/sal, y verifica sin recortar la contraseña', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-auth-'))
  assert.equal(dirname(dir), tmpdir())
  t.after(() => rm(dir, { recursive: true, force: true }))
  const archivo = join(dir, 'admin.json')
  await writeFile(archivo, JSON.stringify(config), { mode: 0o600 })
  assert.ok(!JSON.stringify(config).includes(password))
  assert.equal((await verificarCredenciales('prueba-local', password, archivo)).usuario, 'prueba-local')
  assert.equal(await verificarCredenciales('otro-usuario', password, archivo), null)
  assert.equal(await verificarCredenciales('prueba-local', password.trim(), archivo), null)
  assert.equal(await readFile(archivo, 'utf8'), JSON.stringify(config))
})

test('ausencia, configuración inválida y archivo dentro de checkout rechazan autenticación', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-auth-'))
  assert.equal(dirname(dir), tmpdir())
  t.after(() => rm(dir, { recursive: true, force: true }))
  await assert.rejects(leerCredenciales(''), { code: 'AUTH_CONFIG' })
  await assert.rejects(leerCredenciales(join(dir, 'ausente.json')), { code: 'AUTH_CONFIG' })
  const archivo = join(dir, 'admin.json')
  await writeFile(archivo, JSON.stringify({ ...config, password: 'NO-PERMITIDA' }), { mode: 0o600 })
  await assert.rejects(leerCredenciales(archivo), { code: 'AUTH_CONFIG' })
  const mal = structuredClone(config)
  mal.admin.scrypt.N = 2
  await writeFile(archivo, JSON.stringify(mal))
  await assert.rejects(leerCredenciales(archivo), { code: 'AUTH_CONFIG' })
  await assert.rejects(leerCredenciales(fileURLToPath(new URL('../../content/catalogo-inicial.json', import.meta.url))), { code: 'AUTH_CONFIG' })
})

test('ninguna bandera de pruebas habilita admin/admin123 sin configuración', async (t) => {
  const anterior = { NODE_ENV: process.env.NODE_ENV, npm_lifecycle_event: process.env.npm_lifecycle_event }
  t.after(() => {
    for (const [k, v] of Object.entries(anterior)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })
  for (const modo of ['production', 'test', 'development']) {
    process.env.NODE_ENV = modo
    process.env.npm_lifecycle_event = 'test'
    await assert.rejects(verificarCredenciales('admin', 'admin123', ''), { code: 'AUTH_CONFIG' })
  }
})
