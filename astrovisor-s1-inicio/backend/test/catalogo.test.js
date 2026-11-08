import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { crearCatalogoInicial, validarCatalogo, proyectarRecorridos, proyectarLibros } from '../src/services/catalogo.js'
import { leerSemilla, inicializarCatalogo, obtenerCatalogo, obtenerRecorridos, obtenerLibros } from '../src/services/documentRepository.js'

const json = async (ruta) => JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'))
const recorridos = await json('../../content/recorridos.json')
const libros = await json('../../frontend/src/data/libros-demo.json')
async function temporal(t) {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-s4-'))
  assert.equal(dirname(dir), tmpdir())
  t.after(() => rm(dir, { recursive: true, force: true }))
  return dir
}

test('semilla unificada: conserva los libros, nueve relaciones y contrato anterior', async () => {
  const semilla = await leerSemilla()
  assert.deepEqual(semilla, crearCatalogoInicial(recorridos, libros))
  assert.deepEqual(proyectarLibros(semilla), libros)
  assert.deepEqual(proyectarRecorridos(semilla), recorridos)
  assert.equal(semilla.recorridos.reduce((n, r) => n + r.libroRefs.length, 0), 9)
  assert.deepEqual(semilla.libros.map((l) => l.id), ['star-lore', 'field-stars', 'half-hours'])
})

test('migración conserva metadatos desconocidos y recursos sin duplicar libros', () => {
  const r = structuredClone(recorridos), l = structuredClone(libros)
  r[0].extra = { conservar: true }
  r[0].libros[0].procedenciaExtra = { conservar: 'referencia' }
  r[0].multimedia[0].extra = ['autoría']
  l[0].extra = { conservar: 'libro' }
  const catalogo = crearCatalogoInicial(r, l)
  assert.equal(catalogo.libros.length, 3)
  assert.deepEqual(proyectarRecorridos(catalogo), r)
  assert.deepEqual(catalogo.libros[0].extra, l[0].extra)
  assert.ok(catalogo.libros.every((b) => !('recomendaciones' in b)))
})

test('migración rechaza bibliografía ambigua o discrepante', () => {
  const distintos = structuredClone(recorridos)
  distintos[0].libros[0].url = 'https://example.org/otra-obra'
  assert.throws(() => crearCatalogoInicial(distintos, libros))
  assert.throws(() => crearCatalogoInicial(recorridos, [...libros, { ...libros[0], id: 'otro' }]))
})

test('inicialización explícita, lectura pública y reapertura desde otro proceso', async (t) => {
  const directorio = await temporal(t)
  await inicializarCatalogo({ directorio })
  assert.deepEqual(await obtenerRecorridos({ directorio }), recorridos)
  assert.deepEqual(await obtenerLibros({ directorio }), libros)
  assert.equal((await obtenerLibros({ directorio, constelacionId: 'orion' })).length, 3)
  const catalogo = await obtenerCatalogo({ directorio })
  catalogo.revision = 7
  catalogo.libros[0].autor = 'Autor revisado en fixture aislado'
  catalogo.extra = { conservar: true }
  await writeFile(join(directorio, 'catalogo.json'), JSON.stringify(catalogo))
  await assert.rejects(inicializarCatalogo({ directorio }), { code: 'EEXIST' })
  assert.deepEqual(await obtenerCatalogo({ directorio }), catalogo)
  const script = `import { obtenerCatalogo } from ${JSON.stringify(new URL('../src/services/documentRepository.js', import.meta.url).href)}; console.log(JSON.stringify(await obtenerCatalogo({directorio:process.argv[1]})))`
  const leido = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script, directorio], { encoding: 'utf8' }))
  assert.deepEqual(leido, catalogo)
})

test('inicialización nunca sobrescribe un archivo válido o corrupto', async (t) => {
  for (const contenido of [JSON.stringify(await leerSemilla()), '{corrupto']) {
    const directorio = await temporal(t)
    await writeFile(join(directorio, 'catalogo.json'), contenido)
    await assert.rejects(inicializarCatalogo({ directorio }), { code: 'EEXIST' })
    assert.equal(await readFile(join(directorio, 'catalogo.json'), 'utf8'), contenido)
  }
})

test('lectura sin configuración o documento ausente no inicializa ni usa respaldo silencioso', async (t) => {
  const directorio = await temporal(t)
  await assert.rejects(obtenerCatalogo({ directorio }), { code: 'ENOENT' })
  await assert.rejects(obtenerCatalogo({ directorio: '' }))
  await assert.rejects(readFile(join(directorio, 'catalogo.json')), { code: 'ENOENT' })
})

test('dos inicializadores compiten sin publicar documentos parciales', async (t) => {
  const directorio = await temporal(t)
  const resultados = await Promise.allSettled([inicializarCatalogo({ directorio }), inicializarCatalogo({ directorio })])
  assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 1)
  assert.deepEqual(await obtenerCatalogo({ directorio }), await leerSemilla())
})

test('comando de inicialización usa entorno explícito y rechaza repetición', async (t) => {
  const directorio = await temporal(t)
  const script = fileURLToPath(new URL('../../scripts/inicializar-catalogo.mjs', import.meta.url))
  const opciones = { encoding: 'utf8', env: { ...process.env, ASTROVISOR_DATA_DIR: directorio }, stdio: 'pipe' }
  assert.match(execFileSync(process.execPath, [script], opciones), /inicializado/)
  const antes = await readFile(join(directorio, 'catalogo.json'), 'utf8')
  assert.throws(() => execFileSync(process.execPath, [script], opciones), (error) => {
    assert.equal(error.status, 1)
    assert.match(error.stderr, /no se ha sobrescrito/)
    return true
  })
  assert.equal(await readFile(join(directorio, 'catalogo.json'), 'utf8'), antes)
})

test('runtime rechaza rutas dentro del checkout y directorios relativos', async () => {
  await assert.rejects(inicializarCatalogo({ directorio: fileURLToPath(new URL('../../content/', import.meta.url)) }), /fuera del checkout/)
  await assert.rejects(obtenerCatalogo({ directorio: 'content' }))
})

test('runtime rechaza un directorio que enlaza al checkout', async (t) => {
  const directorio = await temporal(t)
  const enlace = join(directorio, 'enlace')
  await symlink(fileURLToPath(new URL('../../content/', import.meta.url)), enlace, 'junction')
  await assert.rejects(inicializarCatalogo({ directorio: enlace }), /apunta al checkout/)
})

test('una unidad inexistente termina con error en vez de ascender indefinidamente', { skip: process.platform !== 'win32' }, () => {
  const unidad = [...'ZYXWVUTSRQPONMLKJIHGFEDCBA'].find((l) => !existsSync(`${l}:\\`))
  assert.ok(unidad, 'se requiere una unidad ausente para este caso Windows')
  const script = `import { obtenerCatalogo } from ${JSON.stringify(new URL('../src/services/documentRepository.js', import.meta.url).href)}; try { await obtenerCatalogo({directorio:process.argv[1]}); process.exitCode=1 } catch(e) { if(e.code!=='ENOENT') throw e; console.log('ENOENT') }`
  const salida = execFileSync(process.execPath, ['--input-type=module', '-e', script, `${unidad}:\\astrovisor-data`], { encoding: 'utf8', timeout: 2000, stdio: 'pipe' })
  assert.equal(salida.trim(), 'ENOENT')
})

for (const [caso, alterar] of [
  ['versión desconocida', (c) => { c.schemaVersion = 99 }],
  ['revisión inválida', (c) => { c.revision = 0 }],
  ['ID de recorrido ausente', (c) => { delete c.recorridos[0].id }],
  ['título de recorrido excesivo', (c) => { c.recorridos[0].titulo = 'x'.repeat(201) }],
  ['ID duplicado', (c) => { c.libros.push(c.libros[0]) }],
  ['relación inexistente', (c) => { c.recorridos[0].libroRefs[0].libroId = 'inexistente' }],
  ['relación duplicada', (c) => { c.recorridos[0].libroRefs.push(c.recorridos[0].libroRefs[0]) }],
  ['motivo vacío', (c) => { c.recorridos[0].libroRefs[0].motivo = '' }],
  ['libro huérfano', (c) => { for (const r of c.recorridos) r.libroRefs = r.libroRefs.filter((l) => l.libroId !== 'star-lore') }],
  ['portada fuera de ruta', (c) => { c.libros[0].portadaIlustrativa = '/libros-demo/../privado.svg' }],
  ['portada inexistente', (c) => { c.libros[0].portadaIlustrativa = '/libros-demo/ausente.svg' }],
  ['URL insegura', (c) => { c.libros[0].enlacePublico = 'javascript:alert(1)' }],
  ['recurso inexistente', (c) => { c.recorridos[0].multimedia[0].src = '/audio/ausente.wav' }],
  ['clave peligrosa', (c) => { c.extra = JSON.parse('{"__proto__":{"admin":true}}') }],
]) {
  test(`validación rechaza ${caso} sin cambiar el documento`, async (t) => {
    const catalogo = await leerSemilla()
    alterar(catalogo)
    assert.throws(() => validarCatalogo(catalogo))
    const directorio = await temporal(t)
    const contenido = JSON.stringify(catalogo)
    await writeFile(join(directorio, 'catalogo.json'), contenido)
    await assert.rejects(obtenerCatalogo({ directorio }))
    assert.equal(await readFile(join(directorio, 'catalogo.json'), 'utf8'), contenido)
  })
}

test('JSON malformado produce error de lectura, no reinicialización', async (t) => {
  const directorio = await temporal(t)
  await writeFile(join(directorio, 'catalogo.json'), '{')
  await assert.rejects(obtenerCatalogo({ directorio }))
  assert.equal(await readFile(join(directorio, 'catalogo.json'), 'utf8'), '{')
})

test('las tres portadas SVG mantienen sus hashes aprobados', async () => {
  const hashes = {
    'star-lore': 'c4266615a052733476739e2b6ff22c43c904499f3b05a76b91e684eaf197b9a4',
    'field-stars': 'fd1bd898d6bd05f322badc32ca38c8370762e47f5e2204ec3730007b5c823631',
    'half-hours': 'ee49362effa9a303c4e63adb44c0ae60aee59f1eb3fab2c88602cefc2b98af75',
  }
  for (const [id, hash] of Object.entries(hashes)) {
    const bytes = await readFile(new URL(`../../frontend/public/libros-demo/${id}.svg`, import.meta.url))
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash)
  }
})
