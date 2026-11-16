import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { abrirEscritor, leerSemilla, obtenerCatalogo } from '../backend/src/services/documentRepository.js'

try {
  process.loadEnvFile?.(new URL('../.env', import.meta.url))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const entradas = JSON.parse(await readFile(new URL('../content/libros-biblioteca.json', import.meta.url), 'utf8'))
const hash = createHash('sha256')
for (const { id } of entradas) {
  const foto = await readFile(new URL(`../frontend/public/portadas-biblioteca/${id}.jpg`, import.meta.url))
  hash.update(id).update('\0').update(createHash('sha256').update(foto).digest())
}
const huellaPortadasBiblioteca = hash.digest('hex')

const escritor = await abrirEscritor()
try {
  const actual = await obtenerCatalogo()
  const libros = new Map(actual.libros.map(libro => [libro.id, libro]))
  const recorridos = new Map(actual.recorridos.map(recorrido => [recorrido.id, recorrido]))
  const idsFaltantes = new Set(entradas.map(entrada => entrada.constelacionId).filter(id => !recorridos.has(id)))
  const recorridosFaltantes = []
  if (idsFaltantes.size) {
    const semilla = await leerSemilla()
    for (const id of idsFaltantes) {
      const recorrido = semilla.recorridos.find(ficha => ficha.id === id)
      if (!recorrido) throw new Error(`Falta el recorrido ${id} en el catálogo inicial.`)
      recorridosFaltantes.push(recorrido)
    }
  }
  for (const entrada of entradas) {
    const previo = libros.get(entrada.id)
    if (previo && previo.portada?.tipo !== 'fotografia-ejemplar') {
      throw new Error(`El ID ${entrada.id} pertenece a otro registro.`)
    }
  }
  const pendientes = entradas.filter(({ id, constelacionId }) =>
    !libros.has(id) || !recorridos.get(constelacionId)?.libroRefs.some(ref => ref.libroId === id))
  if (pendientes.length || actual.huellaPortadasBiblioteca !== huellaPortadasBiblioteca) {
    const resultado = await escritor.guardar({
      revision: actual.revision,
      actor: 'importar-libros-biblioteca',
      cambiar(catalogo) {
        catalogo.recorridos.push(...recorridosFaltantes)
        catalogo.huellaPortadasBiblioteca = huellaPortadasBiblioteca
        for (const { id, titulo, autor, constelacionId, motivo } of pendientes) {
          if (!libros.has(id)) catalogo.libros.push({
            id, titulo, autor: autor ?? 'Autor sin confirmar', demostracion: false,
            portada: { tipo: 'fotografia-ejemplar' },
            portadaIlustrativa: `/portadas-biblioteca/${id}.jpg`,
            marc21: { campo001: id, campo003: 'ASTROVISOR', signatura852: null, ubicacion852: null },
          })
          const recorrido = catalogo.recorridos.find(r => r.id === constelacionId)
          if (!recorrido.libroRefs.some(ref => ref.libroId === id)) recorrido.libroRefs.push({ libroId: id, motivo })
        }
      },
    })
    console.log(`Revisión ${resultado.catalogo.revision}. Libros o relaciones incorporados: ${pendientes.length}. Portadas del lote registradas.`)
  } else console.log(`Los libros y las portadas ya están actualizados. Revisión ${actual.revision}.`)
} finally {
  await escritor.cerrar()
}
