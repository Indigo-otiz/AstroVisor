/* Ficha única de constelación. `calcularLayout` produce UNA definición (elementos a dibujar + zonas
   interactivas); `dibujarFicha` la pinta y `zonaAMundo` coloca las zonas de mirada en la escena,
   de modo que dibujo y zonas no pueden desalinearse. No usa DOM: recibe un contexto 2D. */
export const CANVAS = { ancho: 1400, alto: 1200 }
export const PLANO_ANCHO = 3.2
export const PLANO_ALTO = (PLANO_ANCHO * CANVAS.alto) / CANVAS.ancho

export const AVISO_SIN_AUDIO = 'Audio no disponible. Lee la historia en 2D.'
const MENSAJES_NARRACION = {
  cargando: 'Cargando narración…',
  reproduciendo: 'Reproduciendo',
  pausado: 'En pausa',
  listo: 'Lista para escuchar',
  finalizado: 'Narración finalizada',
  bloqueado: 'Pulsa Escuchar para reintentar.',
  error: 'No pudimos reproducir el audio.',
}

export function presentarAudio(narracion) {
  if (!narracion?.recurso) return { etiqueta: 'Escuchar', aviso: AVISO_SIN_AUDIO, activo: false }
  const { estado, puedePausar, puedeReanudar, puedeEscuchar } = narracion
  return {
    etiqueta: puedePausar ? 'Pausar' : puedeReanudar ? 'Reanudar' : estado === 'finalizado' ? 'Repetir' : 'Escuchar',
    aviso: MENSAJES_NARRACION[estado] ?? narracion.mensaje,
    activo: puedePausar || puedeReanudar || puedeEscuchar,
    repetir: Boolean(puedePausar || puedeReanudar || puedeEscuchar || estado === 'pausado' || estado === 'finalizado'),
  }
}

export const BIBLIO_PENDIENTE = 'Sin lecturas recomendadas.'
const FUENTE = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
const fuente = (px, negrita = false) => `${negrita ? 'bold ' : ''}${px}px ${FUENTE}`

export function ajustarLineas(ctx, texto, anchoMax) {
  const palabras = String(texto).split(/\s+/).filter(Boolean)
  const lineas = []
  let linea = ''
  for (const palabra of palabras) {
    const prueba = linea ? `${linea} ${palabra}` : palabra
    if (linea && ctx.measureText(prueba).width > anchoMax) {
      lineas.push(linea)
      linea = palabra
    } else {
      linea = prueba
    }
  }
  if (linea) lineas.push(linea)
  return lineas
}

export function calcularLayout(ctx, ficha, audio = { etiqueta: 'Escuchar', activo: true }, hayLibro = Boolean(ficha.libros?.length)) {
  const items = []
  const zonas = {}
  const x = 100
  const ancho = 1200
  const agregarTexto = (valor, y, tam, color, negrita = false) => {
    ctx.font = fuente(tam, negrita)
    const lineas = ajustarLineas(ctx, valor, ancho - 92)
    items.push({ k: 'texto', lineas, x: x + 46, y, lh: tam + 9, font: ctx.font, color, align: 'left', base: 'top' })
    return lineas.length * (tam + 9)
  }
  const boton = (accion, texto, rect, principal = false) => {
    zonas[accion] = rect
    items.push({
      k: 'boton', rect, radio: 18, fill: principal ? '#f5ce6d' : '#233657',
      stroke: principal ? null : '#7790b6', sw: 3, texto, font: fuente(52, true),
      color: principal ? '#111b31' : '#ffffff', padIzq: rect.h * .6,
    })
  }

  items.push({ k: 'caja', rect: { x, y: 610, w: ancho, h: 564 }, radio: 26, fill: '#101d37', stroke: '#7790b6', sw: 4 })
  const altoTitulo = agregarTexto(ficha.titulo, 646, 78, '#ffffff', true)
  const textoEstado = audio.aviso || (!hayLibro ? BIBLIO_PENDIENTE : '')
  if (textoEstado) agregarTexto(textoEstado, 660 + altoTitulo, 41, '#dce7f8')

  const audioRect = { x: x + 46, y: 835, w: 508, h: 138 }
  const repetir = { x: 680, y: 835, w: 380, h: 138 }
  zonas.audio = audioRect
  if (audio.activo) boton('audio', audio.etiqueta, audioRect, true)
  if (audio.repetir) {
    zonas.repetir = repetir
    boton('repetir', 'Repetir', repetir)
  }
  if (hayLibro) {
    const libros = { x: x + 46, y: 1001, w: 435, h: 131 }
    zonas.libros = libros
    boton('libros', 'Ver libros', libros)
  }
  const volver = { x: 656, y: 1001, w: 598, h: 131 }
  zonas.volver = volver
  boton('volver', 'Volver al cielo', volver)
  return { ...CANVAS, items, zonas }
}

function trazarRecta(ctx, { x, y, w, h }, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function dibujarFicha(ctx, layout) {
  ctx.clearRect(0, 0, layout.ancho, layout.alto)
  for (const it of layout.items) {
    if (it.k === 'caja' || it.k === 'boton') {
      trazarRecta(ctx, it.rect, it.radio ?? 16)
      ctx.fillStyle = it.fill
      ctx.fill()
      if (it.stroke) {
        ctx.strokeStyle = it.stroke
        ctx.lineWidth = it.sw ?? 1
        ctx.stroke()
      }
      if (it.k === 'boton') {
        ctx.font = it.font
        ctx.fillStyle = it.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(it.texto, it.rect.x + it.padIzq + (it.rect.w - it.padIzq) / 2, it.rect.y + it.rect.h / 2)
      }
    } else if (it.k === 'texto') {
      ctx.font = it.font
      ctx.fillStyle = it.color
      ctx.textAlign = it.align
      ctx.textBaseline = it.base
      it.lineas.forEach((linea, i) => ctx.fillText(linea, it.x, it.y + i * it.lh))
    }
  }
}

/** Rectángulo de canvas (px) → posición y tamaño relativos al centro del plano (metros). */
export function zonaAMundo(rect, canvas = CANVAS, planoAncho = PLANO_ANCHO) {
  const escala = planoAncho / canvas.ancho
  return {
    x: (rect.x + rect.w / 2 - canvas.ancho / 2) * escala,
    y: -(rect.y + rect.h / 2 - canvas.alto / 2) * escala,
    ancho: rect.w * escala,
    alto: rect.h * escala,
  }
}
