import { esLibroValido } from './librosDemoService.js'

const mensajes = {
  400: 'Revisa los datos: hay campos o valores no permitidos.',
  401: 'La sesión terminó. Vuelve a iniciar sesión para continuar.',
  403: 'Esta cuenta no tiene permiso para realizar la operación.',
  404: 'El registro ya no está disponible. Recarga el catálogo.',
  409: 'Hay un conflicto de datos. Revisa los valores antes de guardar.',
  412: 'Otra sesión modificó el catálogo. Tu edición se conserva; recarga para revisar los cambios.',
  428: 'Falta la revisión del catálogo. Recarga antes de guardar.',
  503: 'El servicio documental no está disponible. Tu edición se conserva.',
}
const error = (status, mensaje = mensajes[status] ?? 'No pudimos confirmar la solicitud. Revisa la conexión y consulta el catálogo antes de reintentar.') => Object.assign(new Error(mensaje), { status })
const idValido = (id) => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 100
const etagValido = (etag) => typeof etag === 'string' && /^"catalogo-[1-9][0-9]*"$/.test(etag)

async function solicitar(ruta, { token, signal, etag, datos, method = 'GET' }) {
  if (!token) throw error(401)
  let respuesta
  try {
    respuesta = await fetch(ruta, { method, signal, credentials: 'same-origin', cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'If-Match': etag } : {}) },
      ...(method !== 'GET' ? { body: JSON.stringify(datos) } : {}) })
  } catch (e) { if (e.name === 'AbortError') throw e; throw error(0) }
  if (!respuesta.ok) throw error(respuesta.status)
  let cuerpo
  try { cuerpo = await respuesta.json() } catch { throw error(0) }
  const revision = cuerpo?.revision, nueva = respuesta.headers.get('etag')
  if (!Number.isSafeInteger(revision) || revision < 1 || nueva !== `"catalogo-${revision}"`) throw error(0, 'No pudimos validar la revisión recibida. Consulta de nuevo el catálogo antes de guardar.')
  return { cuerpo, etag: nueva }
}

export async function cargarCatalogoAdmin(opciones) {
  const { cuerpo: c, etag } = await solicitar('/api/admin/catalogo', opciones)
  if (c.schemaVersion !== 1 || !Array.isArray(c.libros) || !Array.isArray(c.recorridos)) throw error(0)
  const libros = new Set(c.libros.map((l) => l?.id)), recorridos = new Set(c.recorridos.map((r) => r?.id))
  if (libros.size !== c.libros.length || recorridos.size !== c.recorridos.length || !c.libros.every(esLibroValido)
    || !c.recorridos.every((r) => idValido(r?.id) && ['titulo', 'resumen', 'comoReconocerla'].every((k) => typeof r[k] === 'string')
      && Array.isArray(r.libroRefs) && new Set(r.libroRefs.map((v) => v?.libroId)).size === r.libroRefs.length
      && r.libroRefs.every((v) => libros.has(v?.libroId) && typeof v.motivo === 'string'))) throw error(0, 'El catálogo recibido no tiene la estructura esperada.')
  return { catalogo: c, etag }
}

async function guardar(tipo, id, datos, opciones) {
  if (!opciones.token) throw error(401)
  if (!opciones.etag) throw error(428)
  if (!etagValido(opciones.etag) || !idValido(id) || !datos || typeof datos !== 'object' || Array.isArray(datos)) throw error(400)
  const permitidos = tipo === 'crear' ? ['id', 'titulo', 'autor', 'anio', 'enlacePublico', 'portada', 'relaciones'] : tipo === 'libros' ? ['anio', 'enlacePublico', 'relaciones'] : ['resumen', 'comoReconocerla']
  if (!Object.keys(datos).length || Object.keys(datos).some((k) => !permitidos.includes(k))) throw error(400)
  const { cuerpo, etag } = await solicitar(tipo === 'crear' ? '/api/admin/libros' : `/api/admin/${tipo}/${id}`, { ...opciones, method: tipo === 'crear' ? 'POST' : 'PATCH', datos })
  if (cuerpo.ok !== true || cuerpo.revision !== Number(opciones.etag.match(/[0-9]+/)[0]) + 1) throw error(0)
  return { ...cuerpo, etag }
}
export const guardarLibro = (id, datos, opciones) => guardar('libros', id, datos, opciones)
export const guardarRecorrido = (id, datos, opciones) => guardar('recorridos', id, datos, opciones)
export const crearLibro = (datos, opciones) => guardar('crear', datos.id, datos, opciones)

export async function previsualizarPortada(datos, { token, etag, signal }) {
  if (!token) throw error(401)
  if (!etagValido(etag)) throw error(428)
  let r
  try {
    r = await fetch('/api/admin/portadas/previsualizar', { method: 'POST', signal, cache: 'no-store', credentials: 'same-origin',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'If-Match': etag }, body: JSON.stringify(datos) })
  } catch (e) { if (e.name === 'AbortError') throw e; throw error(0) }
  if (!r.ok) throw error(r.status, r.status === 400 ? 'La portada no es válida o el texto no cabe. Revisa título, autor, plantilla y paleta.' : undefined)
  if (!r.headers.get('content-type')?.startsWith('image/svg+xml')) throw error(0)
  return r.blob()
}
