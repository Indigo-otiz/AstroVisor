import express from 'express'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { obtenerRecorridos, obtenerLibros } from './services/documentRepository.js'
import { crearSesion, destruirSesion, verificarAdmin, crearLimitadorLogin } from './middleware/auth.js'
import { verificarCredenciales } from './services/adminCredentials.js'

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile() } catch {}
  try { process.loadEnvFile('../.env') } catch {}
  try { process.loadEnvFile('frontend/.env') } catch {}
}

export function crearApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use('/api/admin', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (Object.keys(req.query).length) return res.status(400).json({ error: 'Las rutas administrativas no aceptan parámetros en URL' })
    next()
  })
  app.use((req, res, next) => {
    const inicio = Date.now()
    res.on('finish', () => {
      if (!req.path.startsWith('/api/admin')) console.log(`[Express API] ${res.statusCode} ${req.route?.path ?? '<sin ruta>'} (${Date.now() - inicio}ms)`)
    })
    next()
  })
  app.use(express.json({ limit: '64kb' }))
  app.get('/api/health', (_req, res) => res.json({ estado: 'ok', servicio: 'astrovisor-api' }))
  app.get('/api/contenidos/recorridos', async (_req, res, next) => {
    try { res.json(await obtenerRecorridos()) } catch (err) { next(err) }
  })
  app.get('/api/contenidos/libros', async (req, res, next) => {
    const id = req.query.constelacionId
    if (id !== undefined && (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 100)) {
      return res.status(400).json({ error: 'Identificador de constelación inválido' })
    }
    try {
      const libros = await obtenerLibros({ constelacionId: id })
      if (id !== undefined && libros.length === 0) return res.status(404).json({ error: 'Constelación no encontrada' })
      res.json(libros)
    } catch (err) { next(err) }
  })

  app.post('/api/admin/login', crearLimitadorLogin(), async (req, res) => {
    const { usuario, contrasena } = req.body || {}
    if (typeof usuario !== 'string' || !usuario.trim() || usuario.length > 64 || typeof contrasena !== 'string' || !contrasena || contrasena.length > 256 || Buffer.byteLength(contrasena) > 1024) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos o formato inválido' })
    }
    try {
      const admin = await verificarCredenciales(usuario.trim(), contrasena)
      if (!admin) return res.status(401).json({ error: 'Credenciales inválidas o no autorizadas' })
      const token = crearSesion(admin)
      res.json({ ok: true, token, usuario: { id: admin.id, nombre: admin.nombre, usuario: admin.usuario } })
    } catch {
      res.status(503).json({ error: 'Autenticación administrativa no disponible. Inténtalo más tarde.' })
    }
  })
  app.get('/api/admin/sesion', verificarAdmin, (req, res) => res.json({ ok: true, admin: req.admin }))
  app.post('/api/admin/logout', verificarAdmin, (req, res) => {
    destruirSesion(req.headers.authorization.slice(7).trim())
    res.json({ ok: true, mensaje: 'Sesión administrativa cerrada' })
  })
  app.use('/api/admin', verificarAdmin, (_req, res) => res.status(404).json({ error: 'Recurso administrativo no encontrado' }))
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande' })
    console.error('Error API: recurso no disponible')
    res.status(500).json({ error: 'No fue posible cargar el recurso' })
  })
  return app
}

export const app = crearApp()
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const puerto = Number(process.env.PORT ?? 3001)
  app.listen(puerto, () => console.log(`API AstroVisor en http://localhost:${puerto}`))
}
