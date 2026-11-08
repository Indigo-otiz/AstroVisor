/* Datos ilustrativos: no representan existencias ni números de control reales de la biblioteca. */
import catalogo from '../data/libros-demo.json' with { type: 'json' }

export const CONSTELACIONES_LIBROS = Object.freeze(['orion', 'osa-mayor', 'escorpio'])
export const nombresConstelacion = Object.freeze({ orion: 'Orión', 'osa-mayor': 'Osa Mayor', escorpio: 'Escorpio' })

export function listarLibros(idConstelacion) {
  if (!CONSTELACIONES_LIBROS.includes(idConstelacion)) return []
  return catalogo.filter((libro) => typeof libro.recomendaciones?.[idConstelacion] === 'string')
    .map((libro) => ({ ...libro, motivo: libro.recomendaciones[idConstelacion] }))
}

export function buscarLibro(idConstelacion, idLibro) {
  return listarLibros(idConstelacion).find((libro) => libro.id === idLibro) ?? null
}

export function validarCatalogo(datos = catalogo) {
  if (!Array.isArray(datos) || datos.length === 0) return false
  const ids = new Set()
  return datos.every((libro) => {
    if (!libro || typeof libro.id !== 'string' || !/^[a-z0-9-]+$/.test(libro.id) || ids.has(libro.id)) return false
    ids.add(libro.id)
    return ['titulo','autor','portadaIlustrativa'].every((clave) => typeof libro[clave] === 'string' && libro[clave].trim())
      && libro.demostracion === true && libro.portadaIlustrativa.startsWith('/libros-demo/')
      && typeof libro.marc21?.campo001 === 'string' && libro.marc21.campo001.startsWith('DEMO-')
      && libro.marc21.campo003 === 'DEMO'
      && libro.marc21.ubicacion852 === null && libro.marc21.signatura852 === null
      && CONSTELACIONES_LIBROS.every((id) => typeof libro.recomendaciones?.[id] === 'string' && libro.recomendaciones[id].trim())
  })
}
