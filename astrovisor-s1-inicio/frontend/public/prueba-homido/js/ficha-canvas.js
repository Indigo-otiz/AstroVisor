/* Ficha única de constelación. `calcularLayout` produce UNA definición (elementos a dibujar + zonas
   interactivas); `dibujarFicha` la pinta y `zonaAMundo` coloca las zonas de mirada en la escena,
   de modo que dibujo y zonas no pueden desalinearse. No usa DOM: recibe un contexto 2D. */
import { adaptarLibro, historiaParaVisor } from './datos.js'

export const CANVAS = { ancho: 1400, alto: 1200 } // fijo: cambiar el tamaño de una textura WebGL es frágil
export const PLANO_ANCHO = 3.2 // metros en la escena
export const PLANO_ALTO = (PLANO_ANCHO * CANVAS.alto) / CANVAS.ancho

export const AVISO_SIN_AUDIO = 'La narración aún no está disponible. Puedes leer el texto.'
/** Traduce el estado REAL del reproductor (audio/narration.js, vía window.astrovisorVisor.estadoNarracion) a lo que muestra la ficha. */
const MENSAJES_NARRACION = {
  cargando: 'Cargando narración…',
  reproduciendo: 'Reproduciendo narración.',
  pausado: 'En pausa. Reanudar continúa la narración.',
  listo: 'Elige Escuchar para comenzar.',
  finalizado: 'Finalizó. Puedes escucharla de nuevo.',
  bloqueado: 'Retira el visor y toca Activar audio.',
  error: 'Audio no disponible. Puedes leer en modo web 2D.',
}
export function presentarAudio(narracion) {
  if (!narracion || !narracion.recurso) return { etiqueta: 'Escuchar narración', aviso: AVISO_SIN_AUDIO }
  const etiqueta = narracion.puedePausar ? 'Pausar narración' : narracion.puedeReanudar ? 'Reanudar narración' : 'Escuchar narración'
  return { etiqueta, aviso: MENSAJES_NARRACION[narracion.estado] ?? narracion.mensaje ?? null }
}

export const BIBLIO_PENDIENTE = 'Aún no hay un libro verificado para esta constelación. La referencia se agregará cuando esté disponible.'

const FUENTE = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
const MARGEN = 70
const ALTO_BOTON = 100
const TAM = { titulo: 72, resumen: 34, historia: 38, etiqueta: 26, subtitulo: 28, cuerpo: 32, boton: 34, aviso: 28 }
const MAX_HISTORIA_INICIAL = 360
const MIN_HISTORIA = 140 // nunca se reduce la tipografía: si no cabe, se acorta el resumen del visor

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

export function calcularLayout(ctx, ficha, { aviso = null, etiquetaAudio = 'Escuchar narración' } = {}) {
  const { ancho: W, alto: H } = CANVAS
  const anchoUtil = W - 2 * MARGEN
  const yBotonVolver = H - MARGEN - ALTO_BOTON
  const limite = yBotonVolver - 30

  function medir(px, negrita, texto, anchoMax = anchoUtil) {
    ctx.font = fuente(px, negrita)
    return ajustarLineas(ctx, texto, anchoMax)
  }

  function construir(maxHistoria) {
    const items = [{ k: 'caja', rect: { x: 20, y: 20, w: W - 40, h: H - 40 }, radio: 32, fill: '#FFFFFF', stroke: '#D0D5DD', sw: 4 }]
    const zonas = {}
    let y = MARGEN

    if (ficha.demostracion) {
      items.push({ k: 'caja', rect: { x: MARGEN, y, w: 290, h: 52 }, radio: 10, fill: '#EEECFA', stroke: '#C9B8FF', sw: 2 })
      items.push({ k: 'texto', lineas: ['Dato de muestra'], x: MARGEN + 145, y: y + 26, lh: 30, font: fuente(TAM.etiqueta, true), color: '#4A3F99', align: 'center', base: 'middle' })
      y += 52 + 26
    }

    const titulo = medir(TAM.titulo, true, ficha.titulo)
    items.push({ k: 'texto', lineas: titulo, x: MARGEN, y, lh: 80, font: fuente(TAM.titulo, true), color: '#1B2430', align: 'left', base: 'top' })
    y += titulo.length * 80 + 4

    const resumen = medir(TAM.resumen, false, ficha.resumen)
    items.push({ k: 'texto', lineas: resumen, x: MARGEN, y, lh: 46, font: fuente(TAM.resumen), color: '#4A5565', align: 'left', base: 'top' })
    y += resumen.length * 46 + 24

    const historia = medir(TAM.historia, false, historiaParaVisor(ficha, maxHistoria))
    items.push({ k: 'texto', lineas: historia, x: MARGEN, y, lh: 54, font: fuente(TAM.historia), color: '#2D3748', align: 'left', base: 'top' })
    y += historia.length * 54 + 26

    // Referencia bibliográfica (ranura para los datos verificados de Karime)
    const libro = adaptarLibro(ficha)
    const cuerpoTexto = libro
      ? `Para saber más: «${libro.titulo}»${libro.autor ? ` — ${libro.autor}` : ''}`
      : BIBLIO_PENDIENTE
    const cuerpo = medir(TAM.cuerpo, Boolean(libro), cuerpoTexto, anchoUtil - 56)
    const altoBiblio = 28 + 36 + 8 + cuerpo.length * 44 + 28
    items.push({ k: 'caja', rect: { x: MARGEN, y, w: anchoUtil, h: altoBiblio }, radio: 16, fill: '#FAF7F0', stroke: '#E2DCD0', sw: 2 })
    items.push({ k: 'texto', lineas: ['Referencia bibliográfica'], x: MARGEN + 28, y: y + 28, lh: 36, font: fuente(TAM.subtitulo, true), color: '#4A5565', align: 'left', base: 'top' })
    items.push({ k: 'texto', lineas: cuerpo, x: MARGEN + 28, y: y + 28 + 36 + 8, lh: 44, font: fuente(TAM.cuerpo, Boolean(libro)), color: libro ? '#1F4E8C' : '#2D3748', align: 'left', base: 'top' })
    y += altoBiblio + 24

    // Audio: botón + aviso de estado
    const audio = { x: MARGEN, y, w: 460, h: 84 }
    zonas.audio = audio
    items.push({ k: 'boton', rect: audio, fill: '#1F4E8C', texto: `▶  ${etiquetaAudio}`, font: fuente(TAM.boton - 4, true), color: '#FFFFFF', padIzq: audio.h })
    if (aviso) {
      const caja = { x: audio.x + audio.w + 24, y, w: anchoUtil - audio.w - 24, h: 84 }
      const lineasAviso = medir(TAM.aviso, false, aviso, caja.w - 32)
      items.push({ k: 'caja', rect: caja, radio: 10, fill: '#FFF9E6', stroke: '#F5B301', sw: 2 })
      items.push({ k: 'texto', lineas: lineasAviso, x: caja.x + 16, y: caja.y + (caja.h - lineasAviso.length * 34) / 2, lh: 34, font: fuente(TAM.aviso), color: '#614700', align: 'left', base: 'top' })
    }
    y += 84

    const volver = { x: (W - 640) / 2, y: yBotonVolver, w: 640, h: ALTO_BOTON }
    zonas.volver = volver
    items.push({ k: 'boton', rect: volver, fill: '#1F4E8C', texto: '←  Volver al recorrido', font: fuente(TAM.boton + 2, true), color: '#FFFFFF', padIzq: volver.h })

    return { items, zonas, yFin: y }
  }

  let maxHistoria = MAX_HISTORIA_INICIAL
  let layout = construir(maxHistoria)
  while (layout.yFin > limite && maxHistoria > MIN_HISTORIA) {
    maxHistoria -= 40
    layout = construir(maxHistoria)
  }
  return { ancho: W, alto: H, items: layout.items, zonas: layout.zonas, desborda: layout.yFin > limite, maxHistoria }
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
