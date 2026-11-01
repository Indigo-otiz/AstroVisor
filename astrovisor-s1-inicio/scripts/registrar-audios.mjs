// Ejecutar después de producir los WAV. No inventa autoría ni licencia del guion.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const base = new URL('../', import.meta.url)
const ruta = new URL('content/recorridos.json', base)
const datos = JSON.parse(await readFile(ruta, 'utf8'))
const kokoro = process.argv.includes('--kokoro')
const voz = kokoro ? 'Voz sintética femenina: Kokoro ef_dora (español latinoamericano).' : 'Voz sintética en español de México: Piper es_MX-ald-medium.'
const licenciaVozFuente = kokoro ? 'https://huggingface.co/hexgrad/Kokoro-82M' : 'https://huggingface.co/rhasspy/piper-voices/blob/main/es/es_MX/ald/medium/MODEL_CARD'
const manifiesto = []
for (const ficha of datos) {
  const anterior = ficha.multimedia.find((x) => x.tipo === 'audio')
  const src = `/audio/${ficha.id}${kokoro ? '-kokoro-v1' : ''}.wav`
  const archivo = await readFile(new URL(`frontend/public${src}`, base))
  if (archivo.toString('ascii', 0, 4) !== 'RIFF' || archivo.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`WAV inválido: ${src}`)
  const permisoTexto = anterior?.permisoTexto ?? 'Uso de los relatos actuales y voz sintética solicitado por Luis. Autoría y permiso documental del guion pendientes de completar.'
  const recurso = {
    tipo: 'audio', src, formato: 'audio/wav', transcripcion: ficha.historia,
    autorTexto: anterior?.autorTexto ?? 'Autoría de la adaptación de muestra pendiente de identificar por el equipo.',
    procedencia: anterior?.procedencia ?? 'Relato de demostración de content/recorridos.json. Luis confirmó su uso para S3 en esta conversación.',
    voz, permisoTexto,
    permiso: `${permisoTexto} ${kokoro ? 'Modelo de voz Kokoro-82M publicado con licencia Apache-2.0.' : 'El MODEL_CARD de la voz declara Unlicense para su conjunto de datos.'}`,
    estadoDerechos: anterior?.estadoDerechos ?? 'pendiente',
    licenciaVozFuente,
    demostracion: true,
  }
  ficha.multimedia = [recurso, ...ficha.multimedia.filter((x) => x.tipo !== 'audio')]
  manifiesto.push({ id: ficha.id, src, bytes: archivo.length, sha256: createHash('sha256').update(archivo).digest('hex'), transcripcion: `/audio/${ficha.id}.txt`, voz, derechosTexto: recurso.estadoDerechos, escuchaHumana: 'pendiente' })
}
await writeFile(ruta, `${JSON.stringify(datos, null, 2)}\n`)
await mkdir(new URL('docs/evidencias/s3/', base), { recursive: true })
await writeFile(new URL('docs/evidencias/s3/audios.json', base), `${JSON.stringify({ generadoUTC: new Date().toISOString(), recursos: manifiesto }, null, 2)}\n`)
