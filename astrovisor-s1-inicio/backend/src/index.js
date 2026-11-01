import express from 'express'
import { obtenerRecorridos } from './services/documentRepository.js'
import { crearSesion, destruirSesion, verificarAdmin } from './middleware/auth.js'

// Cargar variables de entorno si están disponibles en Node
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile() } catch {}
  try { process.loadEnvFile('../.env') } catch {}
  try { process.loadEnvFile('frontend/.env') } catch {}
}

export const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '64kb' }))

const esModoTest =
  process.env.NODE_ENV === 'test' ||
  process.argv.includes('--test') ||
  process.env.npm_lifecycle_event === 'test'

// Logger en tiempo real para observar llamadas en la terminal
if (!esModoTest) {
  app.use((req, res, next) => {
    const inicio = Date.now()
    res.on('finish', () => {
      const duracion = Date.now() - inicio
      console.log(`[Express API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion}ms)`)
    })
    next()
  })
}

// Health check público
app.get('/api/health', (_req, res) => res.json({ estado: 'ok', servicio: 'astrovisor-api' }))

// Contenidos públicos de demostración
app.get('/api/contenidos/recorridos', async (_req, res, next) => {
  try {
    res.json(await obtenerRecorridos())
  } catch (err) {
    next(err)
  }
})

// ==========================================
// RUTAS DE AUTENTICACIÓN ADMINISTRATIVA (S2)
// ==========================================

// Verifica credenciales directamente en la base de datos de Supabase.

async function verificarCredenciales(usuario, contrasena) {
  // En pruebas unitarias (npm test), usamos un fixture aislado para no depender de red externa
  if (esModoTest) {
    if (usuario === 'admin' && contrasena === 'admin123') {
      return { id: 1, usuario: 'admin', nombre: 'Administrador de Pruebas' }
    }
    return null
  }

  // EN EJECUCIÓN NORMAL: Consulta obligatoria a la tabla 'admin' en Supabase
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Express Auth] Error: Credenciales de Supabase no configuradas en el entorno (.env).')
    return null
  }

  try {
    const url = `${supabaseUrl}/rest/v1/admin?usuario=eq.${encodeURIComponent(usuario)}&contrasena=eq.${encodeURIComponent(contrasena)}&select=id,nombre,usuario`
    const respuesta = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!respuesta.ok) {
      console.error(`[Express Auth] Supabase respondió con error HTTP ${respuesta.status}`)
      return null
    }

    const data = await respuesta.json()
    if (Array.isArray(data) && data.length > 0) {
      return data[0]
    }

    return null
  } catch (err) {
    console.error('[Express Auth] Error de conexión con Supabase:', err.message)
    return null
  }
}

/**
 * POST /api/admin/login
 * Valida credenciales contra la base de datos y emite un token de sesión
 */
app.post('/api/admin/login', async (req, res) => {
  const { usuario, contrasena } = req.body || {}

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Debes proporcionar usuario y contraseña' })
  }

  const admin = await verificarCredenciales(String(usuario).trim(), String(contrasena).trim())

  if (!admin) {
    return res.status(401).json({ error: 'Credenciales inválidas o no autorizadas' })
  }

  const token = crearSesion(admin)

  return res.json({
    ok: true,
    token,
    usuario: admin,
  })
})

/**
 * GET /api/admin/sesion
 * Comprueba que el token del administrador sea válido (Ruta protegida)
 */
app.get('/api/admin/sesion', verificarAdmin, (req, res) => {
  res.json({
    ok: true,
    admin: req.admin,
  })
})

/**
 * POST /api/admin/logout
 * Invalida el token en el servidor
 */
app.post('/api/admin/logout', verificarAdmin, (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/, '').trim()
  destruirSesion(token)
  res.json({ ok: true, mensaje: 'Sesión administrativa cerrada' })
})

/**
 * Rutas administrativas protegidas generales:
 * Cualquier otra ruta bajo /api/admin/* exige token válido
 */
app.use('/api/admin', verificarAdmin, (_req, res) => {
  res.json({ ok: true, mensaje: 'Acceso a recurso administrativo concedido' })
})

// Manejo centralizado de errores
app.use((err, _req, res, _next) => {
  console.error('Error API:', err.message)
  res.status(500).json({ error: 'No fue posible cargar el recurso' })
})

if (!esModoTest) {
  const puerto = Number(process.env.PORT ?? 3001)
  app.listen(puerto, () => console.log(`API AstroVisor en http://localhost:${puerto}`))
}
