// Fixture local de S3. No se sirve en el producto ni cambia documentos reales.
import { createServer } from 'node:http'
import { createInterface } from 'node:readline'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const modos = new Set(['real', 'ausente', 'bloqueado', 'metadatos', 'sin-3d'])
let modo = process.argv[2] ?? 'real'
if (!modos.has(modo)) throw new Error('Modo de prueba inválido')
let grande = process.argv.includes('--texto-grande')
const build = process.argv.includes('--build')
const dist = resolve(fileURLToPath(new URL('../frontend/dist/', import.meta.url)))
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' }
createInterface({ input: process.stdin }).on('line', (linea) => {
  const valor = linea.trim()
  if (modos.has(valor)) modo = valor
  if (valor === 'texto-grande') grande = true
  if (valor === 'texto-normal') grande = false
  console.log(`QA S3: ${modo}, texto ${grande ? '200 % simulado' : 'normal'}, build=${build}`)
})
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:5174')
    if (url.pathname === '/qa-aframe-ausente.js' || (modo === 'ausente' && /^\/audio\/.*\.wav$/.test(url.pathname))) {
      res.writeHead(404); res.end('Ausencia inducida por fixture QA S3'); return
    }
    let bytes, tipo, status = 200
    if (build && !url.pathname.startsWith('/api/')) {
      const path = resolve(dist, `.${decodeURIComponent(url.pathname)}`)
      if (!path.startsWith(dist + sep)) throw new Error('Ruta fuera del build')
      try {
        bytes = await readFile(path.endsWith(sep) ? resolve(path, 'index.html') : path)
        tipo = tipos[extname(path)] ?? (path.endsWith(sep) ? tipos['.html'] : 'application/octet-stream')
      } catch {
        if (extname(path)) { res.writeHead(404); res.end('Recurso no encontrado'); return }
        bytes = await readFile(resolve(dist, 'index.html')); tipo = tipos['.html']
      }
    } else {
      const origen = build ? 'http://127.0.0.1:3001' : 'http://127.0.0.1:5173'
      const upstream = await fetch(origen + req.url)
      bytes = Buffer.from(await upstream.arrayBuffer())
      tipo = upstream.headers.get('content-type') ?? 'application/octet-stream'
      status = upstream.status
    }
    if (modo === 'metadatos' && url.pathname === '/api/contenidos/recorridos' && status === 200) {
      const datos = JSON.parse(bytes.toString('utf8'))
      datos.forEach((x) => { x.multimedia = [{ tipo: 'audio', src: '/audio/invalido.js' }] })
      bytes = Buffer.from(JSON.stringify(datos))
    }
    if (tipo.includes('text/html')) {
      let html = bytes.toString('utf8')
      if (grande) html = html.replace('<head>', '<head><style>html { font-size: 36px !important; }</style>')
      if (modo === 'bloqueado') html = html.replace('<head>', `<head><script>HTMLMediaElement.prototype.play = function () { return Promise.reject(new DOMException('Bloqueo inducido de QA S3', 'NotAllowedError')); };</script>`)
      if (modo === 'sin-3d') html = html.replace('https://aframe.io/releases/1.8.0/aframe.min.js', '/qa-aframe-ausente.js')
      bytes = Buffer.from(html)
    }
    res.writeHead(status, { 'Content-Type': tipo, 'Cache-Control': 'no-store', 'Content-Length': bytes.length })
    res.end(bytes)
  } catch (error) {
    res.writeHead(502); res.end(`Fixture QA S3: ${error.message}`)
  }
}).listen(5174, '127.0.0.1', () => console.log(`QA S3 en http://127.0.0.1:5174 — ${modo}, build=${build}. Escribe real/ausente/bloqueado/metadatos/sin-3d/texto-grande/texto-normal y Enter.`))
