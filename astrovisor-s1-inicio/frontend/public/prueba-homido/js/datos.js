/* Carga y adaptación de los datos de constelaciones para la escena Homido.
   Mismo contrato que /api/contenidos/recorridos (ver content/README.md); no lo modifica. */

import { audioDe } from '../../audio/narration.js'
import { idBibliograficoValido } from './ruta-libro-2d.js'
import { cargarRespaldoPublicado, URL_EXPORTACION } from './respaldo-publicado.js'

export const URL_API = '/api/contenidos/recorridos'
export const URL_RESPALDO = new URL('../data/recorridos-demo.json', import.meta.url).href

const CAMPOS_TEXTO = ['id', 'titulo', 'resumen', 'historia', 'comoReconocerla']

// Reglas equivalentes a frontend/src/services/contentService.js (public/ no puede importar de src/).
export function validarRecorridos(datos) {
  if (!Array.isArray(datos) || datos.length === 0) throw new Error('Respuesta de recorridos inválida')
  const ids = new Set()
  for (const r of datos) {
    if (
      !r ||
      !CAMPOS_TEXTO.every((c) => typeof r[c] === 'string' && r[c].trim().length > 0) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id) ||
      typeof r.demostracion !== 'boolean' ||
      !Array.isArray(r.libros) ||
      !Array.isArray(r.multimedia) ||
      ids.has(r.id)
    ) throw new Error('Ficha de constelación inválida')
    ids.add(r.id)
    if (r.revisionCatalogo !== undefined && (!Number.isSafeInteger(r.revisionCatalogo) || r.revisionCatalogo < 1)) throw new Error('Revisión de catálogo inválida')
    const librosVistos = new Set()
    for (const l of r.libros) {
      if (!l || typeof l.titulo !== 'string' || !l.titulo.trim()) throw new Error('Libro inválido')
      if (Object.hasOwn(l, 'libroId') && (!idBibliograficoValido(l.libroId) || l.constelacionId !== r.id)) throw new Error('Identidad bibliográfica inválida')
      if (r.revisionCatalogo !== undefined && !Object.hasOwn(l, 'libroId')) throw new Error('Falta identidad bibliográfica')
      if (Object.hasOwn(l, 'libroId')) {
        if (librosVistos.has(l.libroId)) throw new Error('Identidad bibliográfica duplicada')
        librosVistos.add(l.libroId)
      }
    }
  }
  return datos
}

async function leerJson(fetchFn, url, timeoutMs) {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), timeoutMs)
  try {
    const respuesta = await fetchFn(url, { signal: control.signal, credentials: 'same-origin' })
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
    return validarRecorridos(await respuesta.json())
  } finally {
    clearTimeout(temporizador)
  }
}

/** Intenta la API; si falla o es inválida usa el respaldo local de demostración. */
export async function cargarDatos({ fetchFn = globalThis.fetch, timeoutMs = 3000, urlApi = URL_API, urlRespaldo = URL_RESPALDO, urlExportacion = URL_EXPORTACION } = {}) {
  try {
    const datos = await leerJson(fetchFn, urlApi, timeoutMs)
    const revisiones = new Set(datos.map(r => r.revisionCatalogo))
    const revision = revisiones.size === 1 && Number.isSafeInteger(datos[0].revisionCatalogo) && datos[0].revisionCatalogo > 0 ? datos[0].revisionCatalogo : null
    return { datos, fuente: 'api', motivo: null, revision, aviso: revision ? `Datos de API, revisión ${revision}.` : 'Datos de API sin revisión verificada.' }
  } catch (errorApi) {
    let carga
    try {
      carga = await cargarRespaldoPublicado({ fetchFn, urlExportacion, timeoutMs })
      validarRecorridos(carga.datos)
      return carga
    } catch { carga?.liberar() }
    const datos = await leerJson(fetchFn, urlRespaldo, timeoutMs)
    return { datos: adaptarRespaldoHeredado(datos), fuente: 'local', motivo: errorApi.message, revision: null,
      aviso: 'Respaldo heredado de demostración, sin revisión verificada; no se afirma que esté actualizado.' }
  }
}

// Escena y narración comparten una sola revisión y los mismos recursos verificados.
let compartida
export function cargarDatosCompartidos() {
  if (!compartida) compartida = cargarDatos().then(carga => {
    globalThis.window?.addEventListener('pagehide', evento => { if (!evento.persisted) carga.liberar?.() })
    return carga
  }).catch(error => { compartida = null; throw error })
  return compartida
}

// Compatibilidad exclusiva del respaldo antiguo: firma URL+autor de tres referencias conocidas, nunca título.
const referenciasHeredadas = [
  ['https://archive.org/details/starloreofallage00olco', 'William Tyler Olcott', 'star-lore'],
  ['https://archive.org/details/fieldbookofstars00olcorich', 'William Tyler Olcott', 'field-stars'],
  ['https://www.gutenberg.org/ebooks/23300', 'Richard A. Proctor', 'half-hours'],
]
export function adaptarRespaldoHeredado(datos) {
  return datos.map(r => ({ ...r, libros: r.libros.map(l => {
    if (Object.hasOwn(l, 'libroId')) return { ...l }
    const coincidencias = referenciasHeredadas.filter(([url, autor]) => l.url === url && l.autor === autor)
    const unicaEnFicha = r.libros.filter(otra => otra.url === l.url && otra.autor === l.autor).length === 1
    const ref = coincidencias.length === 1 && unicaEnFicha ? coincidencias[0] : null
    return { ...l, constelacionId: r.id, ...(ref ? { libroId: ref[2], identidadHeredada: true } : {}) }
  }) }))
}

/* --- Adaptadores de presentación: la identidad de navegación es libroId/constelacionId.
   - libros[i]      = { libroId, constelacionId, titulo, autor, motivo, ... } (API versionada)
   - multimedia[i]  = { tipo: 'audio', src: '/audio/<id>.wav', transcripcion, ... } (Luis; lo valida audioDe) */

export function adaptarLibro(ficha) {
  const libro = ficha.libros.find((l) => l && typeof l.titulo === 'string' && l.titulo.trim())
  if (!libro) return null
  return { titulo: libro.titulo.trim(), autor: typeof libro.autor === 'string' ? libro.autor.trim() : '' }
}

/** Misma regla que el reproductor de Luis (public/audio/narration.js): una sola definición de "audio válido". */
export function adaptarAudio(ficha) {
  return audioDe(ficha)
}

/** Texto breve para el visor. `historiaVisor` es opcional; el texto completo `historia` no se altera. */
export function resumirParaVisor(texto, maxCaracteres) {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  if (limpio.length <= maxCaracteres) return limpio
  const oraciones = limpio.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [limpio]
  let resultado = ''
  for (const o of oraciones) {
    if ((resultado + o).trim().length > maxCaracteres) break
    resultado += o
  }
  if (resultado.trim()) return resultado.trim()
  return limpio.slice(0, maxCaracteres - 1).replace(/\s+\S*$/, '') + '…'
}

export function historiaParaVisor(ficha, maxCaracteres) {
  const base = typeof ficha.historiaVisor === 'string' && ficha.historiaVisor.trim() ? ficha.historiaVisor : ficha.historia
  return resumirParaVisor(base, maxCaracteres)
}
