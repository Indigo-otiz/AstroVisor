import test from 'node:test'
import assert from 'node:assert/strict'
import { app } from '../src/index.js'
import {
  crearSesion,
  obtenerSesion,
  destruirSesion,
  verificarAdmin,
  _resetSesionesParaTest,
} from '../src/middleware/auth.js'

/**
 * Despacha una solicitud a la aplicación Express sin abrir sockets de red TCP,
 * garantizando compatibilidad en cualquier entorno operativo y sandbox.
 */
function simularPeticion(metodo, url, body = {}, headers = {}) {
  return new Promise((resolve) => {
    let statusCode = 200
    let responseData = null

    const req = {
      method: metodo,
      url,
      body,
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
    }

    const res = {
      statusCode: 200,
      status(code) {
        statusCode = code
        this.statusCode = code
        return this
      },
      json(data) {
        responseData = data
        resolve({ status: statusCode, data: responseData })
      },
    }

    app.handle(req, res, () => {
      resolve({ status: 404, data: null })
    })
  })
}

test('middleware auth: almacena y recupera sesiones válidas en el servidor', () => {
  _resetSesionesParaTest()
  const token = crearSesion({ id: 1, usuario: 'admin', nombre: 'Ana' })
  assert.ok(typeof token === 'string' && token.length === 64)

  const sesion = obtenerSesion(token)
  assert.ok(sesion !== null)
  assert.equal(sesion.admin.usuario, 'admin')
  assert.equal(sesion.admin.nombre, 'Ana')

  destruirSesion(token)
  assert.equal(obtenerSesion(token), null)
})

test('middleware auth: verificarAdmin deniega con 401 si no hay token', () => {
  let statusCodigo = null
  let jsonRespuesta = null

  const req = { headers: {} }
  const res = {
    status(code) {
      statusCodigo = code
      return this
    },
    json(data) {
      jsonRespuesta = data
      return this
    },
  }

  let nextLlamado = false
  verificarAdmin(req, res, () => {
    nextLlamado = true
  })

  assert.equal(statusCodigo, 401)
  assert.ok(jsonRespuesta?.error?.includes('token de sesión ausente'))
  assert.equal(nextLlamado, false)
})

test('middleware auth: verificarAdmin autoriza con token válido', () => {
  _resetSesionesParaTest()
  const token = crearSesion({ id: 1, usuario: 'admin', nombre: 'Ana' })

  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }
  const res = {}
  let nextLlamado = false

  verificarAdmin(req, res, () => {
    nextLlamado = true
  })

  assert.equal(nextLlamado, true)
  assert.equal(req.admin?.usuario, 'admin')
})

test('Express API: POST /api/admin/login deniega con 401 ante credenciales incorrectas', async () => {
  const respuesta = await simularPeticion('POST', '/api/admin/login', {
    usuario: 'desconocido',
    contrasena: 'invalida',
  })

  assert.equal(respuesta.status, 401)
  assert.ok(respuesta.data?.error)
})

test('Express API: POST /api/admin/login autoriza con credenciales válidas y emite token', async () => {
  _resetSesionesParaTest()
  const resLogin = await simularPeticion('POST', '/api/admin/login', {
    usuario: 'admin',
    contrasena: 'admin123',
  })

  assert.equal(resLogin.status, 200)
  assert.equal(resLogin.data?.ok, true)
  assert.ok(typeof resLogin.data?.token === 'string' && resLogin.data.token.length > 0)
  assert.equal(resLogin.data?.usuario?.usuario, 'admin')

  const token = resLogin.data.token

  // 1. Probar ruta protegida /api/admin/sesion con el token de Express
  const resSesion = await simularPeticion('GET', '/api/admin/sesion', {}, {
    authorization: `Bearer ${token}`,
  })
  assert.equal(resSesion.status, 200)
  assert.equal(resSesion.data?.admin?.usuario, 'admin')

  // 2. Cerrar sesión en Express
  const resLogout = await simularPeticion('POST', '/api/admin/logout', {}, {
    authorization: `Bearer ${token}`,
  })
  assert.equal(resLogout.status, 200)

  // 3. Comprobar que el token fue invalidado en el servidor
  const resInvalido = await simularPeticion('GET', '/api/admin/sesion', {}, {
    authorization: `Bearer ${token}`,
  })
  assert.equal(resInvalido.status, 401)
})
