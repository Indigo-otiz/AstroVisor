import { lstatSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { configurarPortada } from './portadas.js'

const fallo = (status, mensaje) => Object.assign(new Error(mensaje), { status })
const idValido = (id) => typeof id === 'string' && id.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
const objeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const camposLibro = ['titulo', 'autor', 'anio', 'enlacePublico', 'tema']

function entrada(v, permitidas) {
  if (!objeto(v) || !Object.keys(v).length || Object.keys(v).some((k) => !permitidas.includes(k))) throw fallo(400, 'Campos no permitidos o documento inválido')
  const pendientes = [[v, 0]]
  while (pendientes.length) {
    const [x, profundidad] = pendientes.pop()
    if (profundidad > 32) throw fallo(400, 'Anidamiento excesivo')
    if (typeof x === 'string' && /<[^>]*>/.test(x)) throw fallo(400, 'No se admite contenido HTML')
    if (x && typeof x === 'object') for (const [k, hijo] of Object.entries(x)) {
      if (['__proto__', 'prototype', 'constructor'].includes(k)) throw fallo(400, 'Clave no permitida')
      pendientes.push([hijo, profundidad + 1])
    }
  }
}
function referencias(catalogo, refs, destino, porLibro) {
  if (!Array.isArray(refs) || !refs.length) throw fallo(400, 'Se requieren relaciones válidas')
  const vistos = new Set()
  for (const ref of refs) {
    const campo = porLibro ? 'constelacionId' : 'libroId'
    entrada(ref, [campo, 'motivo'])
    if (!idValido(ref[campo]) || typeof ref.motivo !== 'string' || !ref.motivo.trim() || ref.motivo.length > 1000) throw fallo(400, 'Relación inválida')
    if (vistos.has(ref[campo])) throw fallo(409, 'Relación duplicada')
    vistos.add(ref[campo])
    const recorrido = porLibro ? catalogo.recorridos.find((r) => r.id === ref.constelacionId) : destino
    const libroId = porLibro ? destino.id : ref.libroId
    if (!recorrido || !catalogo.libros.some((l) => l.id === libroId)) throw fallo(400, 'Referencia inexistente')
    const anterior = recorrido.libroRefs.find((r) => r.libroId === libroId)
    if (anterior) anterior.motivo = ref.motivo
    else recorrido.libroRefs.push({ libroId, motivo: ref.motivo })
  }
}

export function editarCatalogo(catalogo, { tipo, id, datos }) {
  const nuevo = tipo === 'crearLibro', libro = tipo !== 'recorrido'
  entrada(datos, libro ? [...camposLibro, 'relaciones', ...(nuevo ? ['id', 'portadaIlustrativa', 'portada'] : [])]
    : ['titulo', 'resumen', 'historia', 'comoReconocerla', 'libroRefs'])
  if (!idValido(nuevo ? datos.id : id)) throw fallo(400, 'ID inválido')
  if (libro && Object.hasOwn(datos, 'tema') && (typeof datos.tema !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(datos.tema))) throw fallo(400, 'Color inválido')
  if (nuevo && catalogo.libros.some((l) => l.id === datos.id)) throw fallo(409, 'ID de libro duplicado')
  if (libro && datos.enlacePublico !== undefined && catalogo.libros.some((l) => l.id !== (nuevo ? datos.id : id) && l.enlacePublico === datos.enlacePublico)) throw fallo(409, 'Referencia bibliográfica duplicada')
  let destino
  if (nuevo) {
    let portada
    if (datos.portada !== undefined) {
      if (datos.portadaIlustrativa !== undefined) throw fallo(400, 'No se aceptan rutas con una plantilla dinámica')
      portada = configurarPortada(datos)
    } else {
      if (datos.portadaIlustrativa !== `/libros-demo/${datos.id}.svg`) throw fallo(400, 'La portada debe corresponder al ID del libro')
      try {
        if (!lstatSync(fileURLToPath(new URL(`../../../frontend/public${datos.portadaIlustrativa}`, import.meta.url))).isFile()) throw new Error()
      } catch { throw fallo(409, 'Portada ilustrativa estática no disponible') }
    }
    destino = { id: datos.id, ...(portada ? { portada } : {}), portadaIlustrativa: portada ? `/api/contenidos/libros/${datos.id}/portada.svg` : datos.portadaIlustrativa, demostracion: true,
      marc21: { campo001: `DEMO-${datos.id}`, campo003: 'DEMO', signatura852: null, ubicacion852: null } }
    catalogo.libros.push(destino)
  } else {
    destino = (libro ? catalogo.libros : catalogo.recorridos).find((v) => v.id === id)
    if (!destino) throw fallo(404, 'Recurso inexistente')
  }
  if (!libro && datos.historia !== undefined && datos.historia !== destino.historia && destino.multimedia.some((m) => m.tipo === 'audio')) {
    throw fallo(409, 'Cambio de historia requiere revisión coordinada de narración')
  }
  const campos = libro ? camposLibro : ['titulo', 'resumen', 'historia', 'comoReconocerla']
  for (const k of campos) if (Object.hasOwn(datos, k)) destino[k] = datos[k]
  if (nuevo || Object.hasOwn(datos, 'relaciones')) referencias(catalogo, datos.relaciones, destino, true)
  if (!libro && Object.hasOwn(datos, 'libroRefs')) referencias(catalogo, datos.libroRefs, destino, false)
}
