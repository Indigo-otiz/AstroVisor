import test from 'node:test'
import assert from 'node:assert/strict'
import { PassThrough } from 'node:stream'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { inicializarAdmin, leerCredenciales } from '../src/services/adminCredentials.js'
import { leerSecreto } from '../../scripts/configurar-admin.mjs'

test('entrada de contraseña no hace eco y restaura terminal al terminar o cancelar', async () => {
  for (const cancelar of [false, true]) {
    const input = new PassThrough(), output = new PassThrough()
    input.isTTY = output.isTTY = true
    input.isRaw = false
    input.setRawMode = (valor) => { input.isRaw = valor }
    let escrito = ''
    output.on('data', (s) => { escrito += s })
    const pendiente = leerSecreto(input, output, 'Secreto: ')
    input.emit('keypress', 'clave-oculta', {})
    input.emit('keypress', '', cancelar ? { ctrl: true, name: 'c' } : { name: 'return' })
    if (cancelar) await assert.rejects(pendiente)
    else assert.equal(await pendiente, 'clave-oculta')
    assert.equal(input.isRaw, false)
    assert.ok(!escrito.includes('clave-oculta'))
  }
})

test('generador guarda solo hash en destino privado exclusivo y no acepta contraseña por argumentos', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-admin-setup-'))
  assert.equal(dirname(dir), tmpdir())
  t.after(() => rm(dir, { recursive: true, force: true }))
  const archivo = join(dir, 'admin.json'), password = randomBytes(24).toString('hex')
  await inicializarAdmin({ archivo, usuario: 'cuenta-local', nombre: 'Prueba', password })
  const antes = await readFile(archivo, 'utf8')
  assert.ok(!antes.includes(password))
  assert.equal((await leerCredenciales(archivo)).admin.usuario, 'cuenta-local')
  await assert.rejects(inicializarAdmin({ archivo, usuario: 'otro-admin', nombre: 'Otra', password }), { code: 'EEXIST' })
  assert.equal(await readFile(archivo, 'utf8'), antes)
  const script = fileURLToPath(new URL('../../scripts/configurar-admin.mjs', import.meta.url))
  assert.throws(() => execFileSync(process.execPath, [script, 'argumento-no-permitido'], { stdio: 'pipe' }), (error) => {
    assert.equal(error.status, 1)
    assert.ok(!error.stderr.toString().includes(password))
    return true
  })
})
