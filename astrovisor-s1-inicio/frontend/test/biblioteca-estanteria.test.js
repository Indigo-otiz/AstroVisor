import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { librosDeEstanteria, datosLocalizacion } from '../src/services/biblioteca.js'

const recorridos = JSON.parse(readFileSync(new URL('../../content/recorridos.json', import.meta.url), 'utf8'))

test('muestra los libros de las tres constelaciones sin cambiar el JSON/API compartido', () => {
  const libros = librosDeEstanteria(recorridos, 'orion')
  assert.equal(libros.length, 3)
  assert.equal(libros[0].constelacionId, 'orion')
  assert.deepEqual(new Set(libros.map((l) => l.constelacionId)), new Set(['orion', 'osa-mayor', 'escorpio']))
  assert.ok(libros.every((l) => l.demostracion && l.titulo && l.autor))
})

test('selección de otra constelación antepone su libro', () => {
  assert.equal(librosDeEstanteria(recorridos, 'escorpio')[0].constelacionId, 'escorpio')
})

test('no presenta ubicaciones ni números MARC como datos confirmados', () => {
  const libro = librosDeEstanteria(recorridos, 'orion')[0]
  assert.deepEqual(datosLocalizacion(libro), { confirmado: false, ubicacion: null, signatura: null, numeroControl: null })
  assert.equal(datosLocalizacion({ catalogo: { control001: 'FICTICIO', ubicacion: 'Sala inventada' } }).confirmado, false)
})

test('distingue control 001/003 de signatura y ubicación cuando estén confirmados', () => {
  const ficha = datosLocalizacion({ catalogo: {
    confirmadoBiblioteca: true, agencia003: 'AG', control001: '0001',
    ubicacion: 'Área de ciencias', signatura: '520 OLC',
  } })
  assert.deepEqual(ficha, {
    confirmado: true, ubicacion: 'Área de ciencias', signatura: '520 OLC', numeroControl: 'AG: 0001',
  })
})

test('descarta enlaces que no sean HTTPS y libros incompletos', () => {
  const libros = librosDeEstanteria([{ id: 'orion', titulo: 'Orión', libros: [
    { titulo: 'Uno', autor: 'A', url: 'javascript:alert(1)' },
    { titulo: '' },
  ] }])
  assert.equal(libros.length, 1)
  assert.equal(libros[0].url, null)
})
