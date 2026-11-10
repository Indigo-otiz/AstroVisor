// Build y API reales con catálogo temporal aislado. No utiliza datos ni cuentas reales.
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { once } = require('node:events')
module.exports = async function servirS4() {
  const root = path.resolve(__dirname, '..')
  const directorioTemporal = await fs.realpath(os.tmpdir())
  const temporal = await fs.mkdtemp(path.join(directorioTemporal, 'astrovisor-s4-qa-'))
  const variables = ['ASTROVISOR_DATA_DIR', 'ASTROVISOR_ADMIN_FILE', 'ASTROVISOR_COVERS_DIR', 'ASTROVISOR_PUBLIC_EXPORT_DIR', 'ASTROVISOR_EXPORT_ORIGIN']
  const anteriores = Object.fromEntries(variables.map(k => [k, process.env[k]]))
  process.env.ASTROVISOR_DATA_DIR = path.join(temporal, 'datos')
  process.env.ASTROVISOR_ADMIN_FILE = path.join(temporal, 'identidad', 'inexistente.json')
  process.env.ASTROVISOR_COVERS_DIR = path.join(temporal, 'imagenes')
  process.env.ASTROVISOR_PUBLIC_EXPORT_DIR = path.join(temporal, 'publico')
  delete process.env.ASTROVISOR_EXPORT_ORIGIN
  let app, api, web
  async function cerrar() {
    if (web) { web.httpServer.closeAllConnections(); await new Promise(r => web.httpServer.close(r)) }
    if (api) { api.closeAllConnections(); await new Promise(r => api.close(r)) }
    await app?.locals.cerrarEscritor()
    for (const k of variables) {
      if (anteriores[k] === undefined) delete process.env[k]
      else process.env[k] = anteriores[k]
    }
    const relativa = path.relative(directorioTemporal, temporal)
    if (relativa.startsWith('astrovisor-s4-qa-') && !relativa.includes(path.sep) && !path.isAbsolute(relativa)) {
      await fs.rm(temporal, { recursive: true, force: true })
    }
  }
  try {
    const repository = await import(pathToFileURL(path.join(root, 'backend/src/services/documentRepository.js')).href)
    await repository.inicializarCatalogo()
    const { crearApp } = await import(pathToFileURL(path.join(root, 'backend/src/index.js')).href)
    app = crearApp()
    await app.locals.iniciarEscritor()
    api = app.listen(3094, '127.0.0.1'); await once(api, 'listening')
    const { preview } = await import('vite')
    web = await preview({ root:path.join(root,'frontend'), configFile:path.join(root,'frontend/vite.config.js'),
      preview:{ host:'127.0.0.1',port:5194,strictPort:true,proxy:{'/api':'http://127.0.0.1:3094'} } })
    const response = await fetch('http://127.0.0.1:5194/api/contenidos/recorridos')
    if (!response.ok) throw new Error('Catálogo temporal S4 no disponible')
    return cerrar
  } catch (error) { await cerrar(); throw error }
}
