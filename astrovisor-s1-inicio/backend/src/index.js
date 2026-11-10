import express from 'express'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { generarPortada, configurarPortada, rutaPortada } from './services/portadas.js'
import { obtenerRecorridos, obtenerLibros, obtenerCatalogo, abrirEscritor, retirarBloqueoAbandonado } from './services/documentRepository.js'
import { editarCatalogo } from './services/catalogoEdicion.js'
import { crearSesion, destruirSesion, verificarAdmin, crearLimitadorLogin } from './middleware/auth.js'
import { verificarCredenciales } from './services/adminCredentials.js'
import { estadoPublicacion } from './services/homidoExport.js'
import { prepararImagen, leerImagen, MAX_IMAGEN } from './services/imageResources.js'

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile() } catch {}
  try { process.loadEnvFile('../.env') } catch {}
  try { process.loadEnvFile('frontend/.env') } catch {}
}

export function crearApp() {
  const app = express()
  let escritor
  // La entrada ejecutable adquiere al arrancar; los consumidores de crearApp deben inicializar y cerrar explícitamente.
  app.locals.iniciarEscritor = async () => {
    if (!escritor) {
      escritor = abrirEscritor()
      escritor.catch(() => { escritor = undefined })
    }
    return escritor
  }
  app.locals.cerrarEscritor = async () => { if (escritor) await (await escritor).cerrar() }
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
  app.use(express.json({ limit: '64kb', inflate: false }))
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
  app.get('/api/contenidos/libros/:id/portada.:formato', async (req, res) => {
    res.set({ 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'none'; sandbox" })
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.id) || req.params.id.length > 100
      || Object.keys(req.query).some((k) => k !== 'revision') || typeof req.query.revision !== 'string' || !/^[1-9][0-9]*$/.test(req.query.revision) || !Number.isSafeInteger(Number(req.query.revision))) return res.status(400).json({ error: 'Identificador o revisión inválidos' })
    try {
      const c = await obtenerCatalogo()
      if (Number(req.query.revision) !== c.revision) return res.status(409).json({ error: 'Revisión obsoleta; consulta de nuevo el catálogo' })
      const libro = c.libros.find((l) => l.id === req.params.id)
      const imagen = libro?.portada?.tipo === 'imagen-autorizada'
      if ((!imagen && !libro?.portada?.plantilla) || req.params.formato !== (imagen ? (libro.portada.formato === 'png' ? 'png' : 'jpg') : 'svg')) return res.status(404).json({ error: 'Portada no encontrada' })
      const contenido = imagen ? await leerImagen(libro.portada) : generarPortada(libro)
      const etiqueta = `"portada-${c.revision}-${createHash('sha256').update(contenido).digest('hex')}"`
      res.set('ETag', etiqueta).type(imagen ? 'image/'+libro.portada.formato : 'image/svg+xml')
      if (req.get('If-None-Match')?.split(',').some((v) => v.trim() === '*' || v.trim().replace(/^W\//, '') === etiqueta)) return res.status(304).end()
      res.send(contenido)
    } catch { res.status(503).json({ error: 'Portada no disponible' }) }
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
  const etag = (revision) => `"catalogo-${revision}"`
  const errorDocumental = (error, res) => res.status(error.status || 503).json({ error: error.status ? error.message : 'Almacenamiento documental no disponible' })
  app.post('/api/admin/imagenes', verificarAdmin, express.raw({ type: ['image/png','image/jpeg'], limit: MAX_IMAGEN, inflate: false }), async (req,res) => {
    const condicion=req.get('If-Match')
    if(!condicion)return res.status(428).json({error:'Se requiere If-Match'})
    if(!/^"catalogo-[1-9][0-9]*"$/.test(condicion))return res.status(400).json({error:'If-Match inválido'})
    try {
      if(condicion!==etag((await obtenerCatalogo()).revision))return res.status(412).json({error:'Revisión obsoleta'})
      const recurso=await prepararImagen(req.body,req.get('Content-Type'))
      const bytes=await leerImagen(recurso)
      res.status(201).json({recurso,previsualizacion:`data:image/${recurso.formato};base64,${bytes.toString('base64')}`,preparada:true,asociada:false})
    }catch(error){errorDocumental(error,res)}
  })
  app.get('/api/admin/catalogo', verificarAdmin, async (_req, res) => {
    try {
      const catalogo = await obtenerCatalogo()
      res.set('ETag', etag(catalogo.revision)).json({ ...catalogo, publicacionHomido: await estadoPublicacion(catalogo.revision), libros: catalogo.libros.map((l) => ({ ...l, portadaIlustrativa: rutaPortada(l, catalogo.revision) })) })
    } catch { errorDocumental({}, res) }
  })
  app.post('/api/admin/portadas/previsualizar', verificarAdmin, async (req, res) => {
    const condicion = req.get('If-Match')
    if (!condicion) return res.status(428).json({ error: 'Se requiere If-Match' })
    if (!/^"catalogo-[1-9][0-9]*"$/.test(condicion)) return res.status(400).json({ error: 'If-Match inválido' })
    try {
      const c = await obtenerCatalogo()
      if (condicion !== etag(c.revision)) return res.status(412).json({ error: 'Revisión obsoleta' })
      if (!req.body || Array.isArray(req.body) || Object.keys(req.body).some((k) => !['titulo', 'autor', 'portada'].includes(k))) return res.status(400).json({ error: 'Datos de portada inválidos' })
      const portada = configurarPortada(req.body)
      res.set({ 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }).type('image/svg+xml').send(generarPortada({ ...req.body, portada }))
    } catch (error) { errorDocumental(error, res) }
  })
  const guardar = (tipo) => async (req, res) => {
    const condicion = req.get('If-Match')
    if (!condicion) return res.status(428).json({ error: 'Se requiere If-Match' })
    const coincidencia = /^"catalogo-([1-9][0-9]*)"$/.exec(condicion)
    if (!coincidencia || !Number.isSafeInteger(Number(coincidencia[1]))) return res.status(400).json({ error: 'If-Match inválido' })
    try {
      const repositorio = await app.locals.iniciarEscritor()
      const resultado = await repositorio.guardar({ revision: Number(coincidencia[1]), actor: req.admin.id,
        cambiar: (catalogo) => editarCatalogo(catalogo, { tipo, id: req.params.id, datos: req.body }) })
      res.set('ETag', etag(resultado.catalogo.revision)).status(tipo === 'crearLibro' ? 201 : 200).json({
        ok: true, revision: resultado.catalogo.revision, durabilidadPendiente: resultado.durabilidadPendiente,
        retencionPendiente: resultado.retencionPendiente, ...await estadoPublicacion(resultado.catalogo.revision),
      })
    } catch (error) { errorDocumental(error, res) }
  }
  app.post('/api/admin/libros', verificarAdmin, guardar('crearLibro'))
  app.patch('/api/admin/libros/:id', verificarAdmin, guardar('libro'))
  app.patch('/api/admin/recorridos/:id', verificarAdmin, guardar('recorrido'))
  app.use('/api/admin', verificarAdmin, (_req, res) => res.status(404).json({ error: 'Recurso administrativo no encontrado' }))
  app.use((err, _req, res, _next) => {
    if (err.type === 'encoding.unsupported') return res.status(415).json({ error: 'No se admiten cuerpos HTTP comprimidos' })
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande' })
    console.error('Error API: recurso no disponible')
    res.status(500).json({ error: 'No fue posible cargar el recurso' })
  })
  return app
}

export const app = crearApp()
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    try { await retirarBloqueoAbandonado() } catch {}
    await app.locals.iniciarEscritor()
    const puerto = Number(process.env.PORT ?? 3001)
    const servidor = app.listen(puerto, () => console.log(`API AstroVisor en http://localhost:${puerto}`))
    for (const señal of ['SIGINT', 'SIGTERM']) process.once(señal, () => {
      servidor.close(async () => { await app.locals.cerrarEscritor(); process.exit(0) })
    })
  } catch (err) {
    console.error('No se pudo abrir el almacén documental privado:', err?.cause?.message || err?.message || err)
    if (err?.cause?.stack) console.error(err.cause.stack)
    process.exitCode = 1
  }
}
