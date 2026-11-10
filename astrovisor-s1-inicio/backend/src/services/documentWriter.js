import * as fs from 'node:fs/promises'
import { join } from 'node:path'
import { hostname } from 'node:os'
import { randomUUID, createHash } from 'node:crypto'
import { setTimeout as esperar } from 'node:timers/promises'
import { obtenerCatalogo } from './documentRepository.js'
import { validarCatalogo } from './catalogo.js'
import { rutaPrivada } from './privateStorage.js'
import { validarImagenes } from './imageResources.js'

const fallo = (status, mensaje) => Object.assign(new Error(mensaje), { status })
const noDisponible = (cause) => Object.assign(new Error('Almacenamiento documental no disponible', { cause }), { status: 503 })
const nombreBackup = /^catalogo-r([1-9][0-9]*)-[a-f0-9-]{36}\.json$/
const hash = (c) => createHash('sha256').update(JSON.stringify(c)).digest('hex')
const codigosOperativos = new Set(['EACCES', 'EPERM', 'EIO', 'ENOSPC', 'EEXIST', 'ENOENT', 'EBUSY', 'ENOTDIR', 'EISDIR', 'ENOTSUP'])
const codigoOperativo = (e) => codigosOperativos.has(e?.code) ? e.code : 'ERROR_OPERATIVO'

async function archivoRegular(ruta, io) {
  const info = await io.lstat(ruta)
  if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1) throw noDisponible()
}
async function directorioReal(ruta, io) {
  const info = await io.lstat(ruta)
  if (!info.isDirectory() || info.isSymbolicLink()) throw noDisponible()
}
async function escribirExclusivo(ruta, contenido, io) {
  const h = await io.open(ruta, 'wx', 0o600)
  try { await h.writeFile(contenido, 'utf8'); await h.sync() }
  catch (error) {
    // Conservar cada fallo de limpieza sin sustituir el error de escritura/sync.
    for (const limpiar of [() => h.close(), () => io.unlink(ruta)]) {
      try { await limpiar() }
      catch (e) { Object.defineProperty(error, 'erroresLimpieza', { value: [...(error.erroresLimpieza ?? []), e], configurable: true }) }
    }
    throw error
  }
  await h.close()
}
async function sincronizarDirectorio(ruta, io) {
  let h, errorOperacion
  try { h = await io.open(ruta, 'r'); await h.sync(); return true }
  catch (e) {
    if (process.platform === 'win32' && ['EPERM', 'EISDIR', 'EINVAL', 'ENOTSUP'].includes(e.code)) return false
    errorOperacion = e
    throw e
  } finally {
    if (h) {
      try { await h.close() }
      catch (e) {
        if (!errorOperacion) throw e
        Object.defineProperty(errorOperacion, 'erroresLimpieza', { value: [...(errorOperacion.erroresLimpieza ?? []), e], configurable: true })
      }
    }
  }
}
async function conControl(ruta, io, operacion) {
  // Serializa alta y retirada de locks para que una recuperación no borre el lock de un nuevo escritor.
  const control = join(ruta, 'control.lock')
  await escribirExclusivo(control, JSON.stringify({ pid: process.pid, host: hostname() }), io)
  let errorOperacion
  try { return await operacion() }
  catch (e) { errorOperacion = e; throw e }
  finally {
    try { await io.unlink(control) }
    catch (e) {
      if (!errorOperacion) throw e
      Object.defineProperty(errorOperacion, 'erroresLimpieza', { value: [...(errorOperacion.erroresLimpieza ?? []), e], configurable: true })
    }
  }
}
async function bloquear(directorio, io) {
  const ruta = await rutaPrivada(directorio)
  await directorioReal(ruta, io)
  const lock = join(ruta, 'escritor.lock')
  const identidad = { pid: process.pid, host: hostname(), nonce: randomUUID() }
  await conControl(ruta, io, () => escribirExclusivo(lock, JSON.stringify(identidad), io))
  return { ruta, async liberar() {
    await archivoRegular(lock, io)
    if ((JSON.parse(await io.readFile(lock, 'utf8'))).nonce !== identidad.nonce) throw noDisponible()
    await io.unlink(lock)
  } }
}
async function leerBackup(ruta, nombre, io) {
  if (!nombreBackup.test(nombre)) throw fallo(400, 'Identificador de respaldo inválido')
  await directorioReal(join(ruta, 'backups'), io)
  const archivo = join(ruta, 'backups', nombre)
  await archivoRegular(archivo, io)
  const sobre = JSON.parse(await io.readFile(archivo, 'utf8'))
  validarCatalogo(sobre.catalogo)
  if (sobre.sha256 !== hash(sobre.catalogo) || String(sobre.catalogo.revision) !== nombre.match(nombreBackup)[1]) throw noDisponible()
  return sobre.catalogo
}
async function respaldar(ruta, catalogo, io) {
  const dir = join(ruta, 'backups')
  await io.mkdir(dir, { mode: 0o700 }).catch((e) => { if (e.code !== 'EEXIST') throw e })
  await directorioReal(dir, io)
  const nombre = `catalogo-r${catalogo.revision}-${randomUUID()}.json`
  await escribirExclusivo(join(dir, nombre), JSON.stringify({ sha256: hash(catalogo), catalogo }), io)
  await leerBackup(ruta, nombre, io)
  await sincronizarDirectorio(dir, io)
}
async function podar(ruta, io) {
  const nombres = (await io.readdir(join(ruta, 'backups'))).filter((n) => nombreBackup.test(n))
  const validos = []
  for (const n of nombres) { await leerBackup(ruta, n, io); validos.push(n) }
  validos.sort((a, b) => Number(b.match(nombreBackup)[1]) - Number(a.match(nombreBackup)[1]) || b.localeCompare(a))
  for (const n of validos.slice(20)) await io.unlink(join(ruta, 'backups', n))
}
async function sustituir(ruta, catalogo, io) {
  const temporal = join(ruta, `catalogo-${randomUUID()}.tmp`)
  let publicado = false, errorOperacion
  try {
    await escribirExclusivo(temporal, `${JSON.stringify(catalogo, null, 2)}\n`, io)
    for (let intento = 0; ; intento++) {
      try { await io.rename(temporal, join(ruta, 'catalogo.json')); publicado = true; break }
      catch (e) {
        if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'EBUSY'].includes(e.code) || intento >= 5) throw e
        await esperar(50 * 2 ** intento)
      }
    }
  } catch (e) { errorOperacion = e; throw e }
  finally {
    if (!publicado) {
      try { await io.unlink(temporal) }
      catch (e) {
        if (e.code !== 'ENOENT') {
          if (!errorOperacion) throw e
          Object.defineProperty(errorOperacion, 'erroresLimpieza', { value: [...(errorOperacion.erroresLimpieza ?? []), e], configurable: true })
        }
      }
    }
  }
}

export async function abrirEscritor({ directorio = process.env.ASTROVISOR_DATA_DIR, io = fs } = {}) {
  let bloqueo
  try {
    bloqueo = await bloquear(directorio, io)
    await archivoRegular(join(bloqueo.ruta, 'catalogo.json'), io)
    await obtenerCatalogo({ directorio: bloqueo.ruta })
  } catch (error) {
    if (bloqueo) {
      try { await bloqueo.liberar() }
      catch (e) { Object.defineProperty(error, 'erroresLimpieza', { value: [...(error.erroresLimpieza ?? []), e], configurable: true }) }
    }
    throw noDisponible(error)
  }
  let cola = Promise.resolve(), cerrado = false
  return {
    guardar({ revision, cambiar, actor }) {
      if (cerrado) return Promise.reject(noDisponible())
      const operacion = cola.then(async () => {
        let actual
        try {
          await archivoRegular(join(bloqueo.ruta, 'catalogo.json'), io)
          actual = await obtenerCatalogo({ directorio: bloqueo.ruta })
        } catch { throw noDisponible() }
        if (!Number.isSafeInteger(revision) || revision < 1) throw fallo(400, 'Revisión inválida')
        if (actual.revision !== revision) throw fallo(412, 'Revisión obsoleta; vuelve a leer el catálogo')
        if (revision === Number.MAX_SAFE_INTEGER) throw fallo(409, 'Límite de revisión alcanzado')
        const siguiente = structuredClone(actual)
        await cambiar(siguiente)
        siguiente.revision = revision + 1
        siguiente.modificadoEn = new Date().toISOString()
        if (actor) siguiente.modificadoPor = actor
        try { validarCatalogo(siguiente) } catch { throw fallo(400, 'Documento o relaciones inválidos') }
        await validarImagenes(siguiente)
        try { await respaldar(bloqueo.ruta, actual, io); await sustituir(bloqueo.ruta, siguiente, io) }
        catch (error) { throw noDisponible(error) }
        // shortcut: rename confirma publicación; un fallo de sync/poda posterior se informa, no revierte el guardado.
        let durabilidadPendiente = false, retencionPendiente = false
        try { durabilidadPendiente = !await sincronizarDirectorio(bloqueo.ruta, io) } catch { durabilidadPendiente = true }
        try { await podar(bloqueo.ruta, io) } catch { retencionPendiente = true }
        return { catalogo: siguiente, durabilidadPendiente, retencionPendiente }
      })
      cola = operacion.catch(() => {})
      return operacion
    },
    async cerrar() {
      if (cerrado) return
      cerrado = true
      await cola
      await bloqueo.liberar()
    },
  }
}

export async function retirarBloqueoAbandonado({ directorio = process.env.ASTROVISOR_DATA_DIR } = {}) {
  try {
    const ruta = await rutaPrivada(directorio), archivo = join(ruta, 'escritor.lock')
    await conControl(ruta, fs, async () => {
      await archivoRegular(archivo, fs)
      const lock = JSON.parse(await fs.readFile(archivo, 'utf8'))
      if (lock.host !== hostname() || !Number.isSafeInteger(lock.pid) || lock.pid < 1 || typeof lock.nonce !== 'string') throw noDisponible()
      try { process.kill(lock.pid, 0); throw noDisponible() } catch (e) { if (e.code !== 'ESRCH') throw noDisponible() }
      await fs.unlink(archivo)
    })
  } catch (error) { throw noDisponible(error) }
}

export async function restaurarCatalogo({ directorio = process.env.ASTROVISOR_DATA_DIR, respaldo, ultimaRevision } = {}) {
  const noConfirmada = { confirmada: false, revisionPersistida: null, limpiezaPendiente: false, codigoLimpieza: null }
  if (!nombreBackup.test(respaldo ?? '') || !Number.isSafeInteger(ultimaRevision) || ultimaRevision < 1) {
    throw Object.assign(fallo(400, 'Respaldo y última revisión conocidos requeridos'), noConfirmada)
  }
  let bloqueo, resultado, errorOperacion
  try {
    bloqueo = await bloquear(directorio, fs)
    const restaurado = await leerBackup(bloqueo.ruta, respaldo, fs)
    const nombres = (await fs.readdir(join(bloqueo.ruta, 'backups'))).filter((n) => nombreBackup.test(n))
    let mayor = Math.max(ultimaRevision, ...nombres.map((n) => Number(n.match(nombreBackup)[1]) + 1))
    const destino = join(bloqueo.ruta, 'catalogo.json')
    let evidencia
    try { await archivoRegular(destino, fs); evidencia = await fs.readFile(destino, 'utf8') }
    catch (e) { if (e.code !== 'ENOENT') throw e }
    try { const c = JSON.parse(evidencia); if (Number.isSafeInteger(c.revision)) mayor = Math.max(mayor, c.revision) } catch {}
    if (!Number.isSafeInteger(mayor) || mayor >= Number.MAX_SAFE_INTEGER) throw noDisponible()
    let actualValido
    try { actualValido = validarCatalogo(JSON.parse(evidencia)) } catch {}
    if (actualValido) await respaldar(bloqueo.ruta, actualValido, fs)
    if (evidencia !== undefined) await escribirExclusivo(join(bloqueo.ruta, `evidencia-${randomUUID()}.json`), evidencia, fs)
    restaurado.revision = mayor + 1
    restaurado.modificadoEn = new Date().toISOString()
    validarCatalogo(restaurado)
    await validarImagenes(restaurado)
    await sustituir(bloqueo.ruta, restaurado, fs)
    resultado = { ...noConfirmada, confirmada: true, revisionPersistida: restaurado.revision,
      catalogo: restaurado, durabilidadPendiente: true }
    try { resultado.durabilidadPendiente = !await sincronizarDirectorio(bloqueo.ruta, fs) } catch {}
  } catch (e) { errorOperacion = Object.assign(noDisponible(e), noConfirmada, { code: codigoOperativo(e) }) }
  // La limpieza no cambia si rename confirmó ni sustituye un error previo de la operación.
  if (bloqueo) {
    try { await bloqueo.liberar() }
    catch (e) {
      const estado = resultado ?? errorOperacion
      estado.limpiezaPendiente = true
      estado.codigoLimpieza = codigoOperativo(e)
    }
  }
  if (errorOperacion) throw errorOperacion
  return resultado
}
