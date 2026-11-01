import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const raiz = new URL('../', import.meta.url)
const binario = /\.(png|jpg|wav)$/i
const fuentes = ['frontend/src', 'frontend/public/audio', 'frontend/public/prueba-homido', 'frontend/test', 'backend/src', 'backend/test', 'content', 'scripts', 'docs/evidencias/s3']
const archivos = ['README.md', 'package.json', 'package-lock.json', 'frontend/package.json', 'frontend/vite.config.js', 'frontend/index.html', 'backend/package.json', 'docs/PRUEBA-S3.md']
async function recorrer(ruta) {
  for (const entrada of await readdir(new URL(`${ruta}/`, raiz), { withFileTypes: true })) {
    const path = `${ruta}/${entrada.name}`
    if (entrada.isDirectory()) await recorrer(path)
    else if (path !== 'docs/evidencias/s3/version.json') archivos.push(path)
  }
}
for (const ruta of fuentes) await recorrer(ruta)
const hashes = []
for (const archivo of [...new Set(archivos)].sort()) {
  const bytes = await readFile(new URL(archivo, raiz))
  const normalizado = binario.test(archivo) ? bytes : Buffer.from(bytes.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'))
  hashes.push({ archivo, sha256: createHash('sha256').update(normalizado).digest('hex'), normalizacion: binario.test(archivo) ? 'bytes originales' : 'UTF-8 sin BOM; LF' })
}
const git = (...args) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8' }).trim()
await writeFile(new URL('docs/evidencias/s3/version.json', raiz), JSON.stringify({
  fechaUTC: new Date().toISOString(), zonaFechaLocal: 'America/Mexico_City', rama: git('branch', '--show-current'),
  commitBase: git('rev-parse', 'HEAD'), implementacionSinCommit: true,
  alcance: 'Verificación local de implementación; no certifica escucha humana, autoría/permiso documental, móvil/Homido ni revisión de otro integrante.',
  hashes,
}, null, 2) + '\n')
console.log(`Manifiesto S3: ${hashes.length} archivos`)
