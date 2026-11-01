/* Carga y adaptación de los datos de constelaciones para la escena Homido.
   Mismo contrato que /api/contenidos/recorridos (ver content/README.md); no lo modifica. */

import { audioDe } from '../../audio/narration.js'

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
export async function cargarDatos({ fetchFn = globalThis.fetch, timeoutMs = 3000, urlApi = URL_API, urlRespaldo = URL_RESPALDO } = {}) {
  try {
    return { datos: await leerJson(fetchFn, urlApi, timeoutMs), fuente: 'api', motivo: null }
  } catch (errorApi) {
    const datos = await leerJson(fetchFn, urlRespaldo, timeoutMs)
    return { datos, fuente: 'local', motivo: errorApi.message }
  }
}

/* --- Adaptadores: único lugar que conoce la forma de libros[] y multimedia[] ---
   SUPUESTOS PENDIENTES DE CONFIRMAR (el contrato actual solo exige arreglos):
   - libros[i]      = { titulo: string, autor?: string }                       (Karime / Carlos)
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
