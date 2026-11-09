/* Lectura documental; los fixtures de demostración solo se conservan para pruebas. */
import { cargarRespaldoPublicado } from '../../public/prueba-homido/js/respaldo-publicado.js'
import { portadaPublicadaValida } from '../../public/prueba-homido/js/paquete-publico.js'

export const CONSTELACIONES_LIBROS = Object.freeze(['orion', 'osa-mayor', 'escorpio'])
export const nombresConstelacion = Object.freeze({ orion: 'Orión', 'osa-mayor': 'Osa Mayor', escorpio: 'Escorpio' })

export async function listarLibros(idConstelacion, { signal, alUsarRespaldo } = {}) {
  if (!CONSTELACIONES_LIBROS.includes(idConstelacion)) return []
  let catalogo
  try {
    const respuesta = await fetch('/api/contenidos/libros', { signal, credentials: 'same-origin', cache: 'no-store' })
    if (!respuesta.ok) throw new Error(`No pudimos consultar los libros (HTTP ${respuesta.status})`)
    catalogo = await respuesta.json()
    if (!validarCatalogo(catalogo)) throw new Error('Catálogo de libros inválido')
  } catch (error) {
    if (signal?.aborted) throw error
    // El lector 2D usa únicamente el paquete verificado y anuncia su procedencia.
    if (!alUsarRespaldo) throw error
    const carga = await cargarRespaldoPublicado({ signal })
    if (!validarCatalogo(carga.libros) || signal?.aborted) { carga.liberar(); throw error }
    catalogo = carga.libros; alUsarRespaldo(carga)
  }
  return catalogo.filter((libro) => typeof libro.recomendaciones?.[idConstelacion] === 'string')
    .map((libro) => ({ ...libro, motivo: libro.recomendaciones[idConstelacion] }))
}

export async function buscarLibro(idConstelacion, idLibro, opciones) {
  return (await listarLibros(idConstelacion, opciones)).find((libro) => libro.id === idLibro) ?? null
}

export function esLibroValido(libro) {
  if (!libro || typeof libro.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(libro.id)) return false
  try {
    const url = new URL(libro.enlacePublico)
    return ['titulo', 'autor'].every((k) => typeof libro[k] === 'string' && libro[k].trim())
      && typeof libro.demostracion === 'boolean' && typeof libro.marc21?.campo001 === 'string' && typeof libro.marc21.campo003 === 'string'
      && typeof libro.portadaIlustrativa === 'string' && (/^\/libros-demo\/[a-z0-9-]+\.svg$/.test(libro.portadaIlustrativa)
        || new RegExp(`^/api/contenidos/libros/${libro.id}/portada\\.svg\\?revision=[1-9][0-9]*$`).test(libro.portadaIlustrativa)
        || portadaPublicadaValida(libro.id, libro.portadaIlustrativa))
      && url.protocol === 'https:' && !url.username && !url.password
  } catch { return false }
}

export function validarCatalogo(datos) {
  if (!Array.isArray(datos)) return false
  const ids = new Set()
  return datos.every((libro) => {
    if (!esLibroValido(libro) || ids.has(libro.id)) return false
    ids.add(libro.id)
    return libro.recomendaciones && typeof libro.recomendaciones === 'object' && !Array.isArray(libro.recomendaciones)
      && Object.entries(libro.recomendaciones).every(([id, motivo]) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && typeof motivo === 'string' && motivo.trim())
  })
}
