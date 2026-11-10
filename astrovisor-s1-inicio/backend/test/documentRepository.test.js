import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { obtenerRecorridos as leerRecorridos, inicializarCatalogo } from '../src/services/documentRepository.js'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

const directorio = await mkdtemp(join(tmpdir(), 'astrovisor-s4-contrato-'))
assert.equal(dirname(directorio), tmpdir())
after(() => rm(directorio, { recursive: true, force: true }))
await inicializarCatalogo({ directorio })
const obtenerRecorridos = () => leerRecorridos({ directorio })

test('el repositorio documental devuelve recorridos de demostración', async () => {
  const recorridos = await obtenerRecorridos()
  assert.ok(Array.isArray(recorridos))
  assert.ok(recorridos.length >= 1)
  assert.ok(recorridos.every(x => typeof x.id === 'string' && typeof x.titulo === 'string'))
  assert.ok(recorridos.every(x => x.demostracion === true))
  assert.equal(new Set(recorridos.map(x => x.id)).size, recorridos.length)
  assert.deepEqual(recorridos.map(x => x.id), ['orion', 'osa-mayor', 'escorpio'])
  for (const recorrido of recorridos) {
    for (const campo of ['titulo', 'resumen', 'historia', 'comoReconocerla']) {
      assert.equal(typeof recorrido[campo], 'string')
      assert.ok(recorrido[campo].trim().length > 0, `${recorrido.id}: falta ${campo}`)
    }
    assert.ok(Array.isArray(recorrido.libros))
    assert.ok(Array.isArray(recorrido.multimedia))
  }
})

test('las tres narraciones tienen WAV PCM real y transcripción fiel al guion de muestra', async () => {
  for (const ficha of await obtenerRecorridos()) {
    const audio = ficha.multimedia.find((x) => x.tipo === 'audio')
    assert.ok(audio, `${ficha.id}: falta narración`)
    assert.match(audio.src, new RegExp(`^/audio/${ficha.id}(?:-[a-z0-9-]+)?\\.wav$`))
    assert.equal(audio.transcripcion, ficha.historia)
    assert.equal(audio.demostracion, true)
    for (const campo of ['autorTexto', 'procedencia', 'voz', 'permiso', 'estadoDerechos', 'licenciaVozFuente']) assert.ok(audio[campo]?.trim())
    const archivo = await readFile(new URL(`../../frontend/public${audio.src}`, import.meta.url))
    assert.equal(archivo.toString('ascii', 0, 4), 'RIFF')
    assert.equal(archivo.toString('ascii', 8, 12), 'WAVE')
    const transcripcion = await readFile(new URL(`../../frontend/public/audio/${ficha.id}.txt`, import.meta.url), 'utf8')
    assert.equal(transcripcion.trim(), audio.transcripcion)
    let formato, datos
    for (let offset = 12; offset + 8 <= archivo.length;) {
      const nombre = archivo.toString('ascii', offset, offset + 4), size = archivo.readUInt32LE(offset + 4)
      assert.ok(offset + 8 + size <= archivo.length, 'Bloque WAV truncado')
      if (nombre === 'fmt ') formato = archivo.subarray(offset + 8, offset + 8 + size)
      if (nombre === 'data') datos = archivo.subarray(offset + 8, offset + 8 + size)
      offset += 8 + size + (size % 2)
    }
    assert.ok(formato && datos)
    assert.equal(formato.readUInt16LE(0), 1) // PCM
    assert.equal(formato.readUInt16LE(14), 16)
    const segundos = datos.length / formato.readUInt32LE(8)
    assert.ok(segundos > 10 && segundos < 120, `${ficha.id}: duración ${segundos}`)
    let suma = 0
    for (let offset = 0; offset + 2 <= datos.length; offset += 2) suma += datos.readInt16LE(offset) ** 2
    assert.ok(Math.sqrt(suma / (datos.length / 2)) > 100, 'El archivo no debe ser silencio')
  }
})

test('el contrato por ID incluye nueve relaciones y conserva los campos del respaldo heredado', async () => {
  const recorridos = await obtenerRecorridos()
  for (const r of recorridos) {
    assert.ok(r.libros.length >= 1, `${r.id}: debe tener al menos una referencia de libro`)
    for (const libro of r.libros) {
      assert.ok(libro.titulo?.trim(), `${r.id}: el libro debe tener título`)
      assert.ok(libro.autor?.trim(), `${r.id}: el libro debe tener autor`)
      assert.ok(libro.libroId && libro.motivo)
      assert.equal(libro.demostracion, true)
      if (libro.referenciaHeredada) assert.equal(libro.etiqueta, 'Referencia de demostración')
    }
  }
  const demoJson = JSON.parse(await readFile(new URL('../../frontend/public/prueba-homido/data/recorridos-demo.json', import.meta.url), 'utf8'))
  assert.equal(recorridos.flatMap(r => r.libros).length, 9)
  const heredado = recorridos.map(({ revisionCatalogo, libros, ...r }) => ({ ...r, libros: libros.filter(l => l.referenciaHeredada).map(({ libroId, constelacionId, motivo, demostracion, referenciaHeredada, portada, ...l }) => l) }))
  assert.deepEqual(demoJson, heredado, 'Los campos bibliográficos previos permanecen intactos; el respaldo no se ha actualizado')
})
