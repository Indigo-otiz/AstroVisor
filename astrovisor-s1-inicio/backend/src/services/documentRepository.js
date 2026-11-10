import { readFile, mkdir, open, link, unlink, realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validarCatalogo, proyectarRecorridos, proyectarLibros } from './catalogo.js'
import { rutaPrivada } from './privateStorage.js'
import { validarImagenes } from './imageResources.js'
export { abrirEscritor, restaurarCatalogo, retirarBloqueoAbandonado } from './documentWriter.js'

const semillaPath = fileURLToPath(new URL('../../../content/catalogo-inicial.json', import.meta.url))

export async function leerSemilla() {
  return validarCatalogo(JSON.parse(await readFile(semillaPath, 'utf8')))
}

/** Creación explícita y exclusiva: no sustituye un catálogo existente. */
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
  const catalogo = validarCatalogo(JSON.parse(await readFile(archivo, 'utf8')))
  await validarImagenes(catalogo)
  return catalogo
}

export async function obtenerRecorridos(opciones) {
  return proyectarRecorridos(await obtenerCatalogo(opciones))
}

export async function obtenerLibros({ constelacionId, ...opciones } = {}) {
  return proyectarLibros(await obtenerCatalogo(opciones), constelacionId)
}
