import { readFile } from 'node:fs/promises'
import { abrirEscritor, obtenerCatalogo } from '../backend/src/services/documentRepository.js'

const entradas = JSON.parse(await readFile(new URL('../content/libros-biblioteca.json', import.meta.url), 'utf8'))
const escritor = await abrirEscritor()
try {
  const actual = await obtenerCatalogo()
  const libros = new Map(actual.libros.map(libro => [libro.id, libro]))
  const recorridos = new Map(actual.recorridos.map(recorrido => [recorrido.id, recorrido]))
  for (const entrada of entradas) {
    const previo = libros.get(entrada.id)
    if (previo && previo.portada?.tipo !== 'fotografia-ejemplar') {
      throw new Error(`El ID ${entrada.id} pertenece a otro registro.`)
    }
    if (!recorridos.has(entrada.constelacionId)) throw new Error(`Falta el recorrido ${entrada.constelacionId}.`)
  }
  const pendientes = entradas.filter(({ id, constelacionId }) =>
    !libros.has(id) || !recorridos.get(constelacionId).libroRefs.some(ref => ref.libroId === id))
  if (pendientes.length) {
    const resultado = await escritor.guardar({
      revision: actual.revision,
      actor: 'importar-libros-biblioteca',
      cambiar(catalogo) {
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
    console.log(`Revisión ${resultado.catalogo.revision}. Registros o relaciones incorporados: ${pendientes.length}.`)
  } else console.log(`Las publicaciones ya están incorporadas. Revisión ${actual.revision}.`)
} finally {
  await escritor.cerrar()
}
