/* Ficha única de constelación. `calcularLayout` produce UNA definición (elementos a dibujar + zonas
   interactivas); `dibujarFicha` la pinta y `zonaAMundo` coloca las zonas de mirada en la escena,
   de modo que dibujo y zonas no pueden desalinearse. No usa DOM: recibe un contexto 2D. */
import { historiaParaVisor } from './datos.js'

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

export const BIBLIO_PENDIENTE = 'Aún no hay lecturas recomendadas para esta constelación.'

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
    // Fondo de la ficha: azul noche con opacidad/borde estilizado
    const items = [{ k: 'caja', rect: { x: 20, y: 20, w: W - 40, h: H - 40 }, radio: 32, fill: '#0d1833', stroke: '#384d7a', sw: 4 }]
    const zonas = {}
    let y = MARGEN

    if (ficha.demostracion) {
      items.push({ k: 'caja', rect: { x: MARGEN, y, w: 290, h: 52 }, radio: 10, fill: '#1e1a3d', stroke: '#8a77d1', sw: 2 })
      items.push({ k: 'texto', lineas: ['Dato de muestra'], x: MARGEN + 145, y: y + 26, lh: 30, font: fuente(TAM.etiqueta, true), color: '#d8d0fc', align: 'center', base: 'middle' })
      y += 52 + 20
    }

    const titulo = medir(TAM.titulo, true, ficha.titulo)
    items.push({ k: 'texto', lineas: titulo, x: MARGEN, y, lh: 80, font: fuente(TAM.titulo, true), color: '#FFFFFF', align: 'left', base: 'top' })
    y += titulo.length * 80 + 4

    const resumen = medir(TAM.resumen, false, ficha.resumen)
    items.push({ k: 'texto', lineas: resumen, x: MARGEN, y, lh: 46, font: fuente(TAM.resumen), color: '#CBD5E1', align: 'left', base: 'top' })
    y += resumen.length * 46 + 20

    // En VR el audio es el canal protagónico; se resume el texto para mantener la escena despejada
    const historia = medir(TAM.historia, false, historiaParaVisor(ficha, maxHistoria))
    items.push({ k: 'texto', lineas: historia, x: MARGEN, y, lh: 52, font: fuente(TAM.historia), color: '#94A3B8', align: 'left', base: 'top' })
    y += historia.length * 52 + 24

    // Invitación a lecturas recomendadas
    const hayLibro = Array.isArray(ficha.libros) &&
      ficha.libros.some((l) => typeof l?.titulo === 'string' && l.titulo.trim())
    const altoLecturas = 150
    items.push({ k: 'caja', rect: { x: MARGEN, y, w: anchoUtil, h: altoLecturas },
      radio: 18, fill: '#1c180e', stroke: '#c99632', sw: 3 })
    if (hayLibro) {
      items.push({ k: 'texto', lineas: ['¿Te gustaría descubrir más?'],
        x: MARGEN + 26, y: y + 16, lh: 35, font: fuente(30, true),
        color: '#f5c056', align: 'left', base: 'top' })
      const libros = { x: MARGEN + 24, y: y + 58, w: anchoUtil - 48, h: 74 }
      zonas.libros = libros
      items.push({ k: 'boton', rect: libros, fill: '#1F4E8C',
        texto: '★  Ver libros recomendados', font: fuente(34, true),
        color: '#FFFFFF', padIzq: 0 })
    } else {
      items.push({ k: 'texto', lineas: medir(TAM.cuerpo, false, BIBLIO_PENDIENTE),
        x: MARGEN + 26, y: y + 45, lh: 46, font: fuente(TAM.cuerpo),
        color: '#edd7a8', align: 'left', base: 'top' })
    }
    y += altoLecturas + 22

    // Fila de controles de Audio: Escuchar/Pausa + Repetir + aviso de estado
    const wBotonAudio = 480
    const wBotonRepetir = 280
    const audio = { x: MARGEN, y, w: wBotonAudio, h: 84 }
    const repetir = { x: MARGEN + wBotonAudio + 18, y, w: wBotonRepetir, h: 84 }
    zonas.audio = audio
    zonas.repetir = repetir

    items.push({ k: 'boton', rect: audio, fill: '#1F4E8C', texto: `▶  ${etiquetaAudio}`, font: fuente(TAM.boton - 4, true), color: '#FFFFFF', padIzq: 0 })
    items.push({ k: 'boton', rect: repetir, fill: '#2A3D75', texto: '↺  Repetir', font: fuente(TAM.boton - 4, true), color: '#FFFFFF', padIzq: 0 })

    if (aviso) {
      const xAviso = repetir.x + repetir.w + 18
      const wAviso = anchoUtil - (wBotonAudio + wBotonRepetir + 36)
      const caja = { x: xAviso, y, w: wAviso, h: 84 }
      const lineasAviso = medir(TAM.aviso, false, aviso, caja.w - 24)
      items.push({ k: 'caja', rect: caja, radio: 10, fill: '#241b08', stroke: '#F5B301', sw: 2 })
      items.push({ k: 'texto', lineas: lineasAviso, x: caja.x + 12, y: caja.y + (caja.h - lineasAviso.length * 32) / 2, lh: 32, font: fuente(TAM.aviso), color: '#ffe699', align: 'left', base: 'top' })
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
  ctx.lineTo(x + r, y + h)
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
