import { readFile, lstat, mkdir, open, link, unlink } from 'node:fs/promises'
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'
import { dirname, join } from 'node:path'
import { rutaPrivada } from './privateStorage.js'

const derivar = promisify(scrypt)
const parametros = Object.freeze({ N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 })
const usuarioValido = (v) => typeof v === 'string' && /^[a-zA-Z0-9._-]{3,64}$/.test(v)
const texto = (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 100
const soloClaves = (v, claves) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === claves.length && claves.every((k) => Object.hasOwn(v, k))
const errorConfiguracion = () => Object.assign(new Error('Autenticación administrativa no disponible'), { code: 'AUTH_CONFIG' })
const resumen = (v) => createHash('sha256').update(v).digest()
let verificacionesActivas = 0

export async function inicializarAdmin({ archivo = process.env.ASTROVISOR_ADMIN_FILE, usuario, nombre, password }) {
  const ruta = await rutaPrivada(archivo)
  const config = await crearConfiguracionAdmin(usuario, nombre, password)
  await mkdir(dirname(ruta), { recursive: true, mode: 0o700 })
  await rutaPrivada(ruta)
  const temporal = join(dirname(ruta), `admin-${randomUUID()}.tmp`)
  const handle = await open(temporal, 'wx', 0o600)
  try {
    try { await handle.writeFile(`${JSON.stringify(config, null, 2)}\n`); await handle.sync() }
    finally { await handle.close() }
    await link(temporal, ruta)
  } finally { await unlink(temporal) }
}

export async function crearConfiguracionAdmin(usuario, nombre, password) {
  if (!usuarioValido(usuario) || !texto(nombre)) throw new Error('Usuario o nombre inválido')
  if (typeof password !== 'string' || password.length < 15 || password.length > 256 || Buffer.byteLength(password) > 1024) {
    throw new Error('La contraseña debe tener entre 15 y 256 caracteres, máximo 1024 bytes')
  }
  const salt = randomBytes(16).toString('hex')
  const hash = (await derivar(password, Buffer.from(salt, 'hex'), 64, parametros)).toString('hex')
  return { schemaVersion: 1, admin: { id: randomUUID(), usuario, nombre,
    scrypt: { N: parametros.N, r: parametros.r, p: parametros.p, salt, hash } } }
}

export async function leerCredenciales(archivo = process.env.ASTROVISOR_ADMIN_FILE) {
  try {
    const ruta = await rutaPrivada(archivo)
    const info = await lstat(ruta)
    if (!info.isFile() || info.isSymbolicLink() || info.size > 16384 || (process.platform !== 'win32' && (info.mode & 0o077) !== 0)) throw errorConfiguracion()
    const config = JSON.parse(await readFile(ruta, 'utf8'))
    if (!soloClaves(config, ['schemaVersion', 'admin']) || config.schemaVersion !== 1) throw errorConfiguracion()
    const a = config.admin
    if (!soloClaves(a, ['id', 'usuario', 'nombre', 'scrypt']) || !texto(a.id) || !usuarioValido(a.usuario) || !texto(a.nombre)) throw errorConfiguracion()
    const h = a.scrypt
    if (!soloClaves(h, ['N', 'r', 'p', 'salt', 'hash']) || h.N !== parametros.N || h.r !== parametros.r || h.p !== parametros.p ||
      typeof h.salt !== 'string' || !/^[a-f0-9]{32}$/.test(h.salt) || typeof h.hash !== 'string' || !/^[a-f0-9]{128}$/.test(h.hash)) throw errorConfiguracion()
    return { admin: a, huella: resumen(JSON.stringify(config)).toString('hex') }
  } catch { throw errorConfiguracion() }
}

export async function verificarCredenciales(usuario, password, archivo = process.env.ASTROVISOR_ADMIN_FILE) {
  const { admin, huella } = await leerCredenciales(archivo)
  if (!usuarioValido(usuario) || typeof password !== 'string' || !password || password.length > 256 || Buffer.byteLength(password) > 1024) return null
  if (verificacionesActivas >= 2) throw Object.assign(new Error('Autenticación ocupada'), { code: 'AUTH_BUSY' })
  verificacionesActivas++
  try {
    const obtenido = await derivar(password, Buffer.from(admin.scrypt.salt, 'hex'), 64, parametros)
    const coincideClave = timingSafeEqual(obtenido, Buffer.from(admin.scrypt.hash, 'hex'))
    const coincideUsuario = timingSafeEqual(resumen(usuario), resumen(admin.usuario))
    return coincideClave && coincideUsuario ? { id: admin.id, usuario: admin.usuario, nombre: admin.nombre, huella } : null
  } finally { verificacionesActivas-- }
}
