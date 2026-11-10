import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { generarPortada, rutaPortada, configurarPortada } from './portadas.js'

const publicDir = fileURLToPath(new URL('../../../frontend/public/', import.meta.url))
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const idValido = (valor) => typeof valor === 'string' && valor.length <= 100 && ID.test(valor)
const texto = (valor, max = 12000) => typeof valor === 'string' && valor.trim().length > 0 && valor.length <= max
const objeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor)
function exigir(condicion, detalle) {
  if (!condicion) throw new Error(`Catálogo inválido: ${detalle}`)
}
function clavesSeguras(valor) {
  if (!valor || typeof valor !== 'object') return
  for (const [clave, hijo] of Object.entries(valor)) {
    exigir(!['__proto__', 'prototype', 'constructor'].includes(clave), 'clave no permitida')
    clavesSeguras(hijo)
  }
}
function activo(src, patron) {
  exigir(typeof src === 'string' && patron.test(src), 'ruta de recurso no permitida')
  exigir(statSync(join(publicDir, src.slice(1))).isFile(), 'recurso ausente')
}
function https(valor) {
  try {
    const url = new URL(valor)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch { return false }
}

export function validarCatalogo(catalogo) {
  exigir(objeto(catalogo), 'se esperaba un objeto')
  clavesSeguras(catalogo)
  exigir(catalogo.schemaVersion === 1, 'versión no soportada')
  exigir(Number.isSafeInteger(catalogo.revision) && catalogo.revision > 0, 'revisión no válida')
  const { libros, recorridos } = catalogo
  exigir(Array.isArray(libros) && libros.length > 0, 'faltan libros')
  exigir(Array.isArray(recorridos) && recorridos.length > 0, 'faltan recorridos')
  const idsLibros = new Set(), idsRecorridos = new Set(), vinculados = new Set()
  for (const libro of libros) {
    exigir(objeto(libro) && idValido(libro.id) && !idsLibros.has(libro.id), 'ID de libro inválido o duplicado')
    idsLibros.add(libro.id)
    exigir(texto(libro.titulo, 200) && texto(libro.autor, 200), 'título o autor inválido')
    exigir(libro.anio === undefined || (Number.isInteger(libro.anio) && libro.anio > 0 && libro.anio <= 9999), 'año inválido')
    exigir(texto(libro.enlacePublico, 2048) && https(libro.enlacePublico), 'enlace de libro inválido')
    exigir(typeof libro.demostracion === 'boolean', 'falta identificación de demostración')
    exigir(objeto(libro.marc21) && texto(libro.marc21.campo001, 200) && texto(libro.marc21.campo003, 200), 'metadatos MARC inválidos')
    exigir(!('recomendaciones' in libro), 'las relaciones pertenecen al recorrido')
    if (libro.portada !== undefined) {
      if (libro.portada.tipo === 'imagen-autorizada') {
        configurarPortada(libro)
        exigir(libro.portadaIlustrativa === rutaPortada(libro), 'ruta de imagen inválida')
      } else {
        generarPortada(libro)
        exigir(libro.portadaIlustrativa === `/api/contenidos/libros/${libro.id}/portada.svg`, 'ruta dinámica inválida')
      }
    } else activo(libro.portadaIlustrativa, /^\/libros-demo\/[a-z0-9-]+\.svg$/)
  }
  for (const recorrido of recorridos) {
    exigir(objeto(recorrido) && idValido(recorrido.id) && !idsRecorridos.has(recorrido.id), 'ID de recorrido inválido o duplicado')
    idsRecorridos.add(recorrido.id)
    exigir(Object.entries({ titulo: 200, resumen: 1000, historia: 12000, comoReconocerla: 12000 }).every(([c, max]) => texto(recorrido[c], max)), 'texto de recorrido inválido')
    exigir(typeof recorrido.demostracion === 'boolean' && !('libros' in recorrido), 'estructura de recorrido inválida')
    exigir(Array.isArray(recorrido.libroRefs) && Array.isArray(recorrido.multimedia), 'relaciones o recursos inválidos')
    const relaciones = new Set()
    for (const ref of recorrido.libroRefs) {
      exigir(objeto(ref) && idsLibros.has(ref.libroId) && !relaciones.has(ref.libroId), 'relación inválida o duplicada')
      exigir(texto(ref.motivo, 1000), 'motivo de lectura inválido')
      exigir(ref.referencia === undefined || objeto(ref.referencia), 'metadatos de referencia inválidos')
      if (ref.referencia) exigir(!['titulo', 'autor', 'anio', 'url'].some((c) => c in ref.referencia), 'referencia con datos bibliográficos duplicados')
      relaciones.add(ref.libroId)
      vinculados.add(ref.libroId)
    }
    for (const recurso of recorrido.multimedia) {
      exigir(objeto(recurso) && recurso.tipo === 'audio', 'tipo de recurso no soportado')
      activo(recurso.src, /^\/audio\/[a-z0-9-]+\.(wav|mp3|m4a|ogg)$/)
      exigir(['transcripcion', 'autorTexto', 'voz', 'procedencia', 'permiso'].every((c) => texto(recurso[c])), 'metadatos de audio incompletos')
      exigir(recurso.transcripcion === recorrido.historia, 'transcripción distinta de la historia')
    }
  }
  exigir(libros.every((l) => vinculados.has(l.id)), 'libro sin constelación')
  return catalogo
}

/** Migración explícita de los documentos de PR #6; no modifica las entradas. */
export function crearCatalogoInicial(recorridos, librosDemo) {
  exigir(Array.isArray(recorridos) && Array.isArray(librosDemo), 'entradas de migración inválidas')
  const libros = librosDemo.map(({ recomendaciones, ...libro }) => structuredClone(libro))
  const fichas = recorridos.map(({ libros: referencias, ...recorrido }) => {
    exigir(Array.isArray(referencias), 'bibliografía ausente')
    const originales = new Map()
    for (const { titulo, autor, anio, url, ...metadatos } of referencias) {
      const candidatos = libros.filter((l) => l.titulo === titulo)
      exigir(candidatos.length === 1, 'referencia sin correspondencia única')
      const libro = candidatos[0]
      exigir(libro.autor === autor && libro.anio === anio && libro.enlacePublico === url, 'fuentes bibliográficas discrepantes')
      exigir(!originales.has(libro.id), 'referencia duplicada')
      exigir(texto(librosDemo.find((l) => l.id === libro.id)?.recomendaciones?.[recorrido.id]), 'referencia sin relación')
      originales.set(libro.id, metadatos)
    }
    const libroRefs = librosDemo.filter((l) => Object.hasOwn(l.recomendaciones ?? {}, recorrido.id)).map((l) => ({
      libroId: l.id,
      motivo: l.recomendaciones[recorrido.id],
      ...(originales.has(l.id) ? { referencia: structuredClone(originales.get(l.id)) } : {}),
    }))
    return { ...structuredClone(recorrido), libroRefs }
  })
  const ids = new Set(fichas.map((r) => r.id))
  exigir(librosDemo.every((l) => objeto(l.recomendaciones) && Object.keys(l.recomendaciones).every((id) => ids.has(id))), 'recomendación a constelación inexistente')
  return validarCatalogo({ schemaVersion: 1, revision: 1, recorridos: fichas, libros })
}

const camposPublicos = (objeto, campos) => Object.fromEntries(campos.filter(c => Object.hasOwn(objeto, c)).map(c => [c, objeto[c]]))
/** Una ficha pública por relación; la bibliografía editable sigue solo en libros[]. */
export function proyectarRecorridos({ recorridos, libros, revision }) {
  const porId = new Map(libros.map((l) => [l.id, l]))
  return recorridos.map((recorrido) => ({
    ...camposPublicos(recorrido, ['id', 'titulo', 'resumen', 'historia', 'comoReconocerla', 'demostracion', 'historiaVisor']),
    revisionCatalogo: revision,
    multimedia: recorrido.multimedia.map(m => camposPublicos(m, ['tipo', 'src', 'formato', 'transcripcion', 'autorTexto', 'procedencia', 'voz', 'permisoTexto', 'permiso', 'estadoDerechos', 'licenciaVozFuente', 'demostracion'])),
    libros: recorrido.libroRefs.map((r) => {
      const l = porId.get(r.libroId)
      return { ...camposPublicos(r.referencia ?? {}, ['licencia', 'etiqueta', 'aclaracion']),
        libroId: l.id, constelacionId: recorrido.id, titulo: l.titulo, autor: l.autor, ...(l.anio === undefined ? {} : { anio: l.anio }), url: l.enlacePublico,
        motivo: r.motivo, demostracion: l.demostracion, referenciaHeredada: r.referencia !== undefined,
        portada: l.portada?.tipo === 'imagen-autorizada' ? { tipo: 'imagen-autorizada', origen: 'imagen', formato: l.portada.formato, src: rutaPortada(l, revision), procedencia:l.portada.procedencia, permiso:l.portada.permiso, textoAlternativo:l.portada.textoAlternativo }
          : l.portada?.plantilla ? { tipo: 'ilustrativa', origen: 'plantilla', plantilla: l.portada.plantilla, paleta: l.portada.paleta }
          : { tipo: 'ilustrativa', origen: 'estatica', src: l.portadaIlustrativa } }
    }),
  }))
}

export function proyectarLibros({ recorridos, libros, revision }, constelacionId) {
  return libros.flatMap((libro) => {
    const recomendaciones = Object.fromEntries(recorridos.flatMap((r) => {
      const ref = r.libroRefs.find((l) => l.libroId === libro.id)
      return ref ? [[r.id, ref.motivo]] : []
    }))
    if (constelacionId !== undefined && !Object.hasOwn(recomendaciones, constelacionId)) return []
    const campos = ['id', 'titulo', 'autor', 'anio', 'enlacePublico', 'portadaIlustrativa', 'tema', 'demostracion', 'marc21']
    return [{ ...Object.fromEntries(campos.filter((c) => Object.hasOwn(libro, c)).map((c) => [c, libro[c]])), portadaIlustrativa: rutaPortada(libro, revision), recomendaciones,
      ...(libro.portada?.tipo === 'imagen-autorizada' ? { portada:camposPublicos(libro.portada,['tipo','formato','procedencia','permiso','textoAlternativo']) } : {}),
      ...(constelacionId === undefined ? {} : { motivo: recomendaciones[constelacionId] }) }]
  })
}
