import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { once } from 'node:events'
import { app } from '../src/index.js'
import { inicializarCatalogo } from '../src/services/documentRepository.js'

let directorio, server, base
const original = process.env.ASTROVISOR_DATA_DIR
before(async () => {
  directorio = await mkdtemp(join(tmpdir(), 'astrovisor-s4-api-'))
  assert.equal(dirname(directorio), tmpdir())
  await inicializarCatalogo({ directorio })
  process.env.ASTROVISOR_DATA_DIR = directorio
  server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  base = `http://127.0.0.1:${server.address().port}`
})
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
  if (original === undefined) delete process.env.ASTROVISOR_DATA_DIR
  else process.env.ASTROVISOR_DATA_DIR = original
  if (directorio) await rm(directorio, { recursive: true, force: true })
})

test('GET público conserva recorridos y expone catálogo completo o filtrado sin sesión', async () => {
  const recorridos = await fetch(`${base}/api/contenidos/recorridos`)
  assert.equal(recorridos.status, 200)
  const anterior = JSON.parse(await readFile(new URL('../../content/recorridos.json', import.meta.url), 'utf8'))
  assert.deepEqual(await recorridos.json(), anterior)
  const libros = await fetch(`${base}/api/contenidos/libros`)
  assert.equal(libros.status, 200)
  const catalogoAnterior = JSON.parse(await readFile(new URL('../../frontend/src/data/libros-demo.json', import.meta.url), 'utf8'))
  assert.deepEqual(await libros.json(), catalogoAnterior)
  const filtrados = await fetch(`${base}/api/contenidos/libros?constelacionId=orion`)
  assert.equal(filtrados.status, 200)
  const datos = await filtrados.json()
  assert.equal(datos.length, 3)
  assert.ok(datos.every((l) => l.motivo === l.recomendaciones.orion))
})

test('filtro inválido o inexistente produce 400/404 y el runtime no se sirve como archivo', async () => {
  assert.equal((await fetch(`${base}/api/contenidos/libros?constelacionId=../privado`)).status, 400)
  assert.equal((await fetch(`${base}/api/contenidos/libros?constelacionId=orion&constelacionId=escorpio`)).status, 400)
  assert.equal((await fetch(`${base}/api/contenidos/libros?constelacionId=inexistente`)).status, 404)
  assert.equal((await fetch(`${base}/catalogo.json`)).status, 404)
})

test('documento inválido devuelve error controlado sin filtrar ruta ni reinicializar', async () => {
  const archivo = join(directorio, 'catalogo.json')
  const valido = await readFile(archivo, 'utf8')
  try {
    await writeFile(archivo, '{')
    const respuesta = await fetch(`${base}/api/contenidos/recorridos`)
    assert.equal(respuesta.status, 500)
    assert.deepEqual(await respuesta.json(), { error: 'No fue posible cargar el recurso' })
    assert.equal(await readFile(archivo, 'utf8'), '{')
  } finally { await writeFile(archivo, valido) }
})
