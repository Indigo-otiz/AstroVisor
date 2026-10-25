// Servidor auxiliar de QA. No forma parte de la aplicación ni modifica contenido.
import { createServer } from 'node:http'
import { createInterface } from 'node:readline'

const modos = new Set(['real', 'lento', 'error', 'vacio', 'invalido'])
let modo = process.argv[2] ?? 'real'
if (!modos.has(modo)) throw new Error('Modos: real, lento, error, vacio, invalido')
let textoGrande = process.argv.includes('--texto-grande')
createInterface({ input: process.stdin }).on('line', (entrada) => {
  if (entrada.trim() === 'texto-grande') textoGrande = true
  if (entrada.trim() === 'texto-normal') textoGrande = false
  if (modos.has(entrada.trim())) {
    modo = entrada.trim()
    console.log(`Condición QA: ${modo}`)
  }
})

createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      const condicion = modo
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      if (condicion === 'lento') await new Promise((resolve) => setTimeout(resolve, 12000))
      if (condicion === 'error') {
        res.writeHead(503)
        res.end('{"error":"Fallo inducido de QA"}')
        return
      }
      if (condicion === 'vacio') {
        res.end('[]')
        return
      }
      if (condicion === 'invalido') {
        res.end('{}')
        return
      }
      const upstream = await fetch(`http://127.0.0.1:5173${req.url}`)
      res.writeHead(upstream.status)
      res.end(await upstream.text())
      return
    }
    const upstream = await fetch('http://127.0.0.1:5173/')
    const html = (await upstream.text())
      .replace(/(src|href)="\//g, '$1="http://127.0.0.1:5173/')
      .replace('<head>', `<head>${textoGrande ? '<style>html { font-size: 36px !important; }</style>' : ''}`)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch {
    res.writeHead(502)
    res.end('No se puede consultar Vite/API. Inicia primero la aplicación real.')
  }
}).listen(5174, '127.0.0.1', () =>
  console.log(
    `QA en http://127.0.0.1:5174/ — modo ${modo}; texto ${textoGrande ? '200 %' : 'normal'}. Escribe un modo y Enter para cambiarlo.`,
  ),
)
