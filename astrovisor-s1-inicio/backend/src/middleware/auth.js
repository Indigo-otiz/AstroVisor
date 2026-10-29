import crypto from 'node:crypto'

// Almacén de sesiones activas en el servidor Express
const sesionesActivas = new Map()

// Duración de la sesión: 8 horas
const DURACION_SESION_MS = 8 * 60 * 60 * 1000

/**
 * Crea una sesión para un administrador autenticado y devuelve un token criptográfico
 */
export function crearSesion(adminData) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiracion = Date.now() + DURACION_SESION_MS

  sesionesActivas.set(token, {
    admin: {
      id: adminData.id,
      nombre: adminData.nombre,
      usuario: adminData.usuario,
    },
    expiracion,
  })

  return token
}

/**
 * Obtiene la sesión activa correspondiente al token
 */
export function obtenerSesion(token) {
  if (!token) return null
  const sesion = sesionesActivas.get(token)
  if (!sesion) return null

  // Verificar si expiró
  if (Date.now() > sesion.expiracion) {
    sesionesActivas.delete(token)
    return null
  }

  return sesion
}

/**
 * Invalida una sesión en el servidor
 */
export function destruirSesion(token) {
  if (token) {
    sesionesActivas.delete(token)
  }
}

/**
 * Middleware para proteger rutas administrativas en Express.
 * Deniega con HTTP 401 cualquier solicitud sin token válido.
 */
export function verificarAdmin(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (!token) {
    return res.status(401).json({
      error: 'Acceso no autorizado: token de sesión ausente',
    })
  }

  const sesion = obtenerSesion(token)
  if (!sesion) {
    return res.status(401).json({
      error: 'Acceso no autorizado: token de sesión inválido o expirado',
    })
  }

  req.admin = sesion.admin
  next()
}

/**
 * Limpieza de sesiones para pruebas
 */
export function _resetSesionesParaTest() {
  sesionesActivas.clear()
}

