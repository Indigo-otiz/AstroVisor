import { validarPuntero, validarManifiesto, validarReferenciasPaquete, registrarPortadaPublicada, retirarPortadaPublicada } from './paquete-publico.js'
import { registrarAudioPublicado } from '../../audio/narration.js'

export const URL_EXPORTACION = '/respaldo-homido/ultima.json'
const hash = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('')
const json = bytes => JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))

export async function cargarRespaldoPublicado({ fetchFn = globalThis.fetch, urlExportacion = URL_EXPORTACION, timeoutMs = 8000, signal } = {}) {
  const control = new AbortController(), urls = []
  const abortar = () => control.abort()
  signal?.addEventListener('abort', abortar, { once: true })
  if (signal?.aborted) abortar()
  const temporizador = setTimeout(abortar, timeoutMs)
  const liberar = () => { for (const url of urls.splice(0)) { retirarPortadaPublicada(url); URL.revokeObjectURL(url) } }
  async function leer(url, max) {
    const r = await fetchFn(url, { signal: control.signal, credentials: 'same-origin', cache: 'no-store' })
    if (!r.ok || Number(r.headers.get('content-length')) > max) throw new Error('Respaldo publicado no disponible')
    const reader = r.body.getReader(), partes = []; let longitud = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      longitud += value.byteLength
      if (longitud > max) { await reader.cancel(); throw new Error('Archivo publicado demasiado grande') }
      partes.push(value)
    }
    const bytes = new Uint8Array(longitud); let offset = 0
    for (const p of partes) { bytes.set(p, offset); offset += p.byteLength }
    return bytes
  }
  try {
    const base = new URL(urlExportacion, globalThis.location?.href ?? 'http://localhost/')
    const p = validarPuntero(json(await leer(base.href, 65536)))
    const manifiestoUrl = new URL(p.manifiesto, base)
    const bytes = await leer(manifiestoUrl.href, 262144)
    if (await hash(bytes) !== p.sha256) throw new Error('Manifiesto alterado')
    const m = validarManifiesto(json(bytes))
    if (m.revision !== p.revision) throw new Error('Revisión publicada incompatible')
    const contenidos = new Map()
    for (const f of m.archivos) {
      const contenido = await leer(new URL(f.ruta, manifiestoUrl).href, f.bytes)
      if (contenido.byteLength !== f.bytes || await hash(contenido) !== f.sha256) throw new Error('Archivo publicado alterado')
      contenidos.set(f.ruta, contenido)
    }
    const datos = json(contenidos.get(m.datos)), libros = json(contenidos.get(m.libros))
    validarReferenciasPaquete(datos, libros, m)
    const activos = new Map()
    for (const [ruta, contenido] of contenidos) {
      if (ruta.endsWith('.json')) continue
      const tipo = ({ svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',wav: 'audio/wav', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg' })[ruta.split('.').pop()]
      const url = URL.createObjectURL(new Blob([contenido], { type: tipo })); urls.push(url); activos.set(ruta, url)
    }
    for (const l of libros) { l.portadaIlustrativa = activos.get(l.portadaIlustrativa); registrarPortadaPublicada(l.id, l.portadaIlustrativa) }
    for (const r of datos) {
      for (const l of r.libros) l.portada.src = activos.get(l.portada.src)
      r.multimedia = r.multimedia.map(a => registrarAudioPublicado({ ...a, src: activos.get(a.src) }))
    }
    return { datos, libros, fuente: 'publicado', revision: m.revision, fecha: m.fecha, liberar,
      aviso: `Copia publicada, revisión ${m.revision}, exportada ${m.fecha}. La API no está disponible; esta copia puede estar desactualizada.` }
  } catch (error) { liberar(); throw error }
  finally { clearTimeout(temporizador); signal?.removeEventListener('abort', abortar) }
}
