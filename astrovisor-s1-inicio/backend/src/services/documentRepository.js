import { readFile, mkdir, open, link, unlink, realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { isAbsolute, join, relative, dirname, basename, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validarCatalogo, proyectarRecorridos, proyectarLibros } from './catalogo.js'

const semillaPath = fileURLToPath(new URL('../../../content/catalogo-inicial.json', import.meta.url))
const checkout = fileURLToPath(new URL('../../../../', import.meta.url))
const dentro = (raiz, ruta) => {
  const distancia = relative(raiz, ruta)
  return distancia === '' || (!isAbsolute(distancia) && distancia !== '..' && !distancia.startsWith(`..${sep}`))
}

async function rutaPrivada(directorio) {
  if (typeof directorio !== 'string' || !isAbsolute(directorio)) throw new Error('Configura ASTROVISOR_DATA_DIR con un directorio privado absoluto fuera del checkout')
  const ruta = resolve(directorio)
  if (dentro(checkout, ruta)) throw new Error('El catálogo de ejecución debe estar fuera del checkout')
  let ancestro = ruta
  const pendientes = []
  while (true) {
    try {
      const real = resolve(await realpath(ancestro), ...pendientes)
      if (dentro(await realpath(checkout), real)) throw new Error('El directorio privado apunta al checkout')
      return ruta
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      if (dirname(ancestro) === ancestro) throw error
      pendientes.unshift(basename(ancestro))
      ancestro = dirname(ancestro)
    }
  }
}

export async function leerSemilla() {
  return validarCatalogo(JSON.parse(await readFile(semillaPath, 'utf8')))
}

/** Única escritura de esta etapa: creación explícita y exclusiva del catálogo. */
export async function inicializarCatalogo({ directorio = process.env.ASTROVISOR_DATA_DIR } = {}) {
  const ruta = await rutaPrivada(directorio)
  const semilla = await leerSemilla()
  await mkdir(ruta, { recursive: true, mode: 0o700 })
  await rutaPrivada(ruta)
  const temporal = join(ruta, `catalogo-${randomUUID()}.tmp`)
  const archivo = await open(temporal, 'wx', 0o600)
  try {
    try {
      await archivo.writeFile(`${JSON.stringify(semilla, null, 2)}\n`, 'utf8')
      await archivo.sync()
    } finally { await archivo.close() }
    // link publica el archivo completo y falla con EEXIST; rename sobrescribiría el destino.
    await link(temporal, join(ruta, 'catalogo.json'))
  } finally { await unlink(temporal) }
}

export async function obtenerCatalogo({ directorio = process.env.ASTROVISOR_DATA_DIR } = {}) {
  const ruta = await rutaPrivada(directorio)
  const archivo = join(ruta, 'catalogo.json')
  if (await realpath(archivo) !== join(await realpath(ruta), 'catalogo.json')) throw new Error('No se permiten enlaces para el archivo de catálogo')
  return validarCatalogo(JSON.parse(await readFile(archivo, 'utf8')))
}

export async function obtenerRecorridos(opciones) {
  return proyectarRecorridos(await obtenerCatalogo(opciones))
}

export async function obtenerLibros({ constelacionId, ...opciones } = {}) {
  return proyectarLibros(await obtenerCatalogo(opciones), constelacionId)
}
