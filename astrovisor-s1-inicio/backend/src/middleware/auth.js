import crypto from 'node:crypto'
import { leerCredenciales } from '../services/adminCredentials.js'

const sesionesActivas = new Map()
const DURACION_SESION_MS = 8 * 60 * 60 * 1000

export function crearSesion(admin) {
  for (const [id, s] of sesionesActivas) if (Date.now() >= s.expiracion) sesionesActivas.delete(id)
  if (sesionesActivas.size >= 256) throw new Error('Capacidad de sesiones alcanzada')
  const token = crypto.randomBytes(32).toString('hex')
  sesionesActivas.set(token, {
    admin: { id: admin.id, nombre: admin.nombre, usuario: admin.usuario },
    huella: admin.huella,
    expiracion: Date.now() + DURACION_SESION_MS,
  })
  return token
}

export function obtenerSesion(token) {
  const sesion = sesionesActivas.get(token)
  if (!sesion) return null
  if (Date.now() >= sesion.expiracion) {
    sesionesActivas.delete(token)
    return null
  }
  return sesion
}

export function destruirSesion(token) { sesionesActivas.delete(token) }

export async function verificarAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  const sesion = token && obtenerSesion(token)
  if (!sesion) return res.status(401).json({ error: 'Acceso no autorizado: token ausente, inválido o expirado' })
  try {
    const actual = await leerCredenciales()
    if (sesion.huella !== actual.huella) {
      destruirSesion(token)
      return res.status(401).json({ error: 'Sesión administrativa revocada' })
    }
    req.admin = sesion.admin
    next()
  } catch {
    destruirSesion(token)
    res.status(503).json({ error: 'Autenticación administrativa no disponible' })
  }
}

export function crearLimitadorLogin({ ahora = Date.now } = {}) {
  const intentos = new Map()
  const ventana = 15 * 60 * 1000
  return (req, res, next) => {
    const tiempo = ahora()
    for (const [ip, valor] of intentos) if (valor.hasta <= tiempo) intentos.delete(ip)
    let valor = intentos.get(req.ip)
    if (!valor) {
      if (intentos.size >= 1000) return res.status(503).json({ error: 'Autenticación temporalmente ocupada' })
      valor = { cantidad: 0, hasta: tiempo + ventana }
      intentos.set(req.ip, valor)
    }
    if (valor.cantidad >= 5) {
      res.set('Retry-After', String(Math.ceil((valor.hasta - tiempo) / 1000)))
      return res.status(429).json({ error: 'Demasiados intentos. Inténtalo más tarde.' })
    }
    valor.cantidad++
    next()
  }
}
