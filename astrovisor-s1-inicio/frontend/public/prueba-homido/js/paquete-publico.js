const exigir = c => { if (!c) throw new Error('Paquete público inválido') }
const portadasPublicadas = new Map()
export const portadaPublicadaValida = (id, src) => portadasPublicadas.get(src) === id
export const registrarPortadaPublicada = (id, src) => portadasPublicadas.set(src, id)
export const retirarPortadaPublicada = src => portadasPublicadas.delete(src)
const revision = n => Number.isSafeInteger(n) && n > 0
export const rutaPublicable = r => typeof r === 'string' && /^(recorridos-demo\.json|libros\.json|portadas\/[a-z0-9]+(?:-[a-z0-9]+)*\.(svg|png|jpg)|audio\/[a-z0-9-]+\.(wav|mp3|m4a|ogg))$/.test(r)
export function validarPuntero(p) {
  exigir(p?.schemaVersion === 1 && revision(p.revision) && p.manifiesto === `revisiones/${p.revision}/manifiesto.json` && /^[a-f0-9]{64}$/.test(p.sha256))
  return p
}
export function validarManifiesto(m) {
  exigir(m?.schemaVersion === 1 && revision(m.revision) && typeof m.fecha === 'string' && Number.isFinite(Date.parse(m.fecha))
    && m.datos === 'recorridos-demo.json' && m.libros === 'libros.json' && Array.isArray(m.archivos) && m.archivos.length >= 2 && m.archivos.length <= 512)
  const vistos = new Set(); let total = 0
  for (const f of m.archivos) {
    exigir(rutaPublicable(f?.ruta) && !vistos.has(f.ruta) && /^[a-f0-9]{64}$/.test(f.sha256) && Number.isSafeInteger(f.bytes) && f.bytes > 0 && f.bytes <= 32 * 1024 * 1024)
    vistos.add(f.ruta); total += f.bytes
  }
  exigir(vistos.has(m.datos) && vistos.has(m.libros) && total <= 64 * 1024 * 1024)
  return m
}
export function validarReferenciasPaquete(recorridos, libros, m) {
  const archivos = new Set(m.archivos.map(f => f.ruta)), utilizados = new Set([m.datos,m.libros]), ids = new Set()
  exigir(Array.isArray(recorridos) && recorridos.length > 0 && Array.isArray(libros) && libros.length > 0)
  const activo = ruta => { exigir(rutaPublicable(ruta) && archivos.has(ruta)); utilizados.add(ruta) }
  for (const l of libros) {
    exigir(typeof l?.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(l.id) && !ids.has(l.id) && typeof l.titulo === 'string' && typeof l.autor === 'string')
    ids.add(l.id); exigir(new RegExp(`^portadas/${l.id}\\.(svg|png|jpg)$`).test(l.portadaIlustrativa));
    if(l.portada?.tipo==='imagen-autorizada')exigir(l.portadaIlustrativa===`portadas/${l.id}.${l.portada.formato==='png'?'png':l.portada.formato==='jpeg'?'jpg':'invalido'}`)
    else exigir(l.portadaIlustrativa.endsWith('.svg'))
    activo(l.portadaIlustrativa)
  }
  const constelaciones = new Set()
  for (const r of recorridos) {
    exigir(r?.revisionCatalogo === m.revision && typeof r.id === 'string' && !constelaciones.has(r.id) && Array.isArray(r.libros) && Array.isArray(r.multimedia))
    constelaciones.add(r.id); const refs = new Set()
    for (const l of r.libros) {
      const ficha = libros.find(x => x.id === l.libroId)
      exigir(ficha && !refs.has(l.libroId) && l.constelacionId === r.id && l.titulo === ficha.titulo && l.autor === ficha.autor && l.url === ficha.enlacePublico && l.motivo === ficha.recomendaciones?.[r.id])
      refs.add(l.libroId); exigir(l.portada?.src === ficha.portadaIlustrativa); activo(l.portada.src)
    }
    for (const a of r.multimedia) { exigir(a.tipo === 'audio' && a.transcripcion === r.historia && a.src.startsWith('audio/')); activo(a.src) }
  }
  for (const l of libros) exigir(l.recomendaciones && Object.keys(l.recomendaciones).length > 0 && Object.keys(l.recomendaciones).every(id => recorridos.some(r => r.id === id && r.libros.some(v => v.libroId === l.id))))
  exigir(utilizados.size === archivos.size)
}
