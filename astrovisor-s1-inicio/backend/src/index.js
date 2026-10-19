import express from 'express'
import { obtenerRecorridos } from './services/documentRepository.js'

export const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', (_req, res) => res.json({ estado: 'ok', servicio: 'astrovisor-api' }))
app.get('/api/contenidos/recorridos', async (_req, res, next) => {
  try { res.json(await obtenerRecorridos()) } catch (err) { next(err) }
})

// Sprint 1: no existe sesión ni identidad de administrador.
// Rechazar en el servidor TODAS las rutas administrativas por defecto.
app.use('/api/admin', (_req, res) => res.status(401).json({ error: 'Acceso administrativo no disponible: autenticación pendiente' }))

app.use((err, _req, res, _next) => {
  console.error('Error API:', err.message)
  res.status(500).json({ error: 'No fue posible cargar el recurso' })
})

if (process.env.NODE_ENV !== 'test') {
  const puerto = Number(process.env.PORT ?? 3001)
  app.listen(puerto, () => console.log(`API AstroVisor en http://localhost:${puerto}`))
}
