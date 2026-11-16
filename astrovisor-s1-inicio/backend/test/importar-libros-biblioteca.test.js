import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { inicializarCatalogo, obtenerCatalogo, obtenerLibros } from '../src/services/documentRepository.js'
import { exportarHomido, verificarPaquete } from '../src/services/homidoExport.js'

const comando = fileURLToPath(new URL('../../scripts/importar-libros-biblioteca.mjs', import.meta.url))
const inventario = JSON.parse(await fs.readFile(new URL('../../content/libros-biblioteca.json', import.meta.url), 'utf8'))

async function prepararCatalogo(t) {
  const raiz = await fs.mkdtemp(join(await fs.realpath(tmpdir()), 'astrovisor-importar-libros-'))
  t.after(() => fs.rm(raiz, { recursive: true, force: true }))
  const opciones = {
    directorio: join(raiz, 'datos'),
    destino: join(raiz, 'publico'),
    credenciales: join(raiz, 'identidad', 'admin.json'),
  }
  await inicializarCatalogo(opciones)
  return {
    opciones,
    importar: () => execFileSync(process.execPath, [comando], {
      env: { ...process.env, ASTROVISOR_DATA_DIR: opciones.directorio },
      encoding: 'utf8',
    }),
    guardarFixture: catalogo => fs.writeFile(join(opciones.directorio, 'catalogo.json'), JSON.stringify(catalogo)),
  }
}

test('la importación completa un catálogo anterior al lote y conserva ediciones', async t => {
  const { opciones, importar, guardarFixture } = await prepararCatalogo(t)
  const anterior = await obtenerCatalogo(opciones)
  anterior.recorridos = anterior.recorridos.filter(r => r.id !== 'can-mayor' && r.id !== 'boyero')
  anterior.recorridos[0].resumen = 'Resumen editado antes de importar los libros.'
  anterior.recorridos[0].libroRefs[0].motivo = 'Motivo editado que debe conservarse.'
  await guardarFixture(anterior)

  assert.match(importar(), /Revisión 2/)
  const catalogo = await obtenerCatalogo(opciones)
  assert.equal(catalogo.libros.length, anterior.libros.length + 15)
  assert.equal(catalogo.recorridos.length, anterior.recorridos.length + 2)
  assert.equal(catalogo.recorridos[0].resumen, anterior.recorridos[0].resumen)
  assert.deepEqual(catalogo.recorridos[0].libroRefs[0], anterior.recorridos[0].libroRefs[0])
  const libros = await obtenerLibros(opciones)
  for (const { id, constelacionId } of inventario) {
    assert.equal(libros.find(l => l.id === id).portadaIlustrativa, `/portadas-biblioteca/${id}.jpg`)
    const recorrido = catalogo.recorridos.find(r => r.id === constelacionId)
    assert.equal(recorrido.libroRefs.filter(ref => ref.libroId === id).length, 1)
  }
  assert.match(importar(), /ya están actualizados. Revisión 2/)
})

test('las portadas renovadas se publican en una revisión nueva y conservan el paquete anterior', async t => {
  const { opciones, importar, guardarFixture } = await prepararCatalogo(t)
  importar()
  const anterior = await obtenerCatalogo(opciones)
  anterior.libros.find(libro => libro.id === 'cazador-de-estrellas').titulo = 'Título editado de prueba'
  delete anterior.huellaPortadasBiblioteca
  await guardarFixture(anterior)

  const archivo = fileURLToPath(new URL('../../frontend/public/portadas-biblioteca/cazador-de-estrellas.jpg', import.meta.url))
  const jpegAnterior = await fs.readFile(new URL('../../frontend/public/portadas-biblioteca/conacyt-la-tierra.jpg', import.meta.url))
  const io = { ...fs, readFile: (ruta, ...args) => ruta === archivo ? jpegAnterior : fs.readFile(ruta, ...args) }
  assert.equal((await exportarHomido({ ...opciones, io })).revision, 2)

  assert.match(importar(), /Revisión 3.*incorporados: 0/)
  assert.equal((await obtenerCatalogo(opciones)).libros.find(l => l.id === 'cazador-de-estrellas').titulo, 'Título editado de prueba')
  assert.equal((await exportarHomido(opciones)).revision, 3)
  assert.match(importar(), /ya están actualizados. Revisión 3/)
  assert.equal((await exportarHomido(opciones)).yaPublicada, true)

  const revisionAnterior = join(opciones.destino, 'revisiones', '2')
  assert.deepEqual(await fs.readFile(join(revisionAnterior, 'portadas', 'cazador-de-estrellas.jpg')), jpegAnterior)
  const revisionNueva = join(opciones.destino, 'revisiones', '3')
  const { manifiesto } = await verificarPaquete(revisionNueva)
  assert.equal(manifiesto.archivos.filter(f => f.ruta.endsWith('.jpg')).length, 15)
  for (const { id } of inventario) {
    const esperada = await fs.readFile(new URL(`../../frontend/public/portadas-biblioteca/${id}.jpg`, import.meta.url))
    assert.deepEqual(await fs.readFile(join(revisionNueva, 'portadas', `${id}.jpg`)), esperada)
  }
})

test('completa los autores pendientes de un lote ya publicado y conserva los autores editados', async t => {
  const { opciones, importar, guardarFixture } = await prepararCatalogo(t)
  importar()
  const anterior = await obtenerCatalogo(opciones)
  const ids = ['mi-gran-libro-del-espacio', 'para-comprender-el-universo', 'viaje-al-espacio', 'conacyt-la-tierra', 'por-que-la-luna']
  const autoresEsperados = new Map(inventario.filter(l => ids.includes(l.id)).map(l => [l.id, l.autor]))
  assert.equal(autoresEsperados.size, 5)
  assert.ok([...autoresEsperados.values()].every(autor => autor && autor !== 'Autor sin confirmar'))
  for (const libro of anterior.libros) {
    if (autoresEsperados.has(libro.id)) libro.autor = 'Autor sin confirmar'
  }
  const editado = anterior.libros.find(l => l.id === 'cazador-de-estrellas')
  editado.autor = 'Autor registrado por la biblioteca'
  await guardarFixture(anterior)
  assert.equal((await exportarHomido(opciones)).revision, 2)

  assert.match(importar(), /Revisión 3.*incorporados: 0.*Autores completados: 5/)
  const actualizado = await obtenerCatalogo(opciones)
  assert.equal(actualizado.huellaPortadasBiblioteca, anterior.huellaPortadasBiblioteca)
  assert.deepEqual(actualizado.recorridos, anterior.recorridos)
  assert.equal((await exportarHomido(opciones)).revision, 3)
  const { libros: publicados } = await verificarPaquete(join(opciones.destino, 'revisiones', '3'))
  autoresEsperados.set(editado.id, editado.autor)
  for (const [id, autor] of autoresEsperados) {
    assert.equal(actualizado.libros.find(l => l.id === id).autor, autor)
    assert.equal(publicados.find(l => l.id === id).autor, autor)
  }
  assert.match(importar(), /ya están actualizados. Revisión 3/)
})
