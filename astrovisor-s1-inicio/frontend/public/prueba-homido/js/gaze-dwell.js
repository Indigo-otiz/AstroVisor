/* Permanencia de la mirada (dwell) — extraída de la lógica de prueba.js ya probada en el visor.
   Un objetivo es cualquier objeto con una `key`; varios elementos pueden compartir key
   (p. ej. punto y aro colisionador) sin reiniciar la carga. */

export const DWELL_MS = 3000 // 3 s sin prisa, para adultos mayores
export const GRACIA_MS = 280 // amortigua parpadeos y micro-temblores de cabeza

export function etapaDe(progreso) {
  if (progreso >= 1) return '100%'
  if (progreso >= 0.66) return '66%'
  if (progreso >= 0.33) return '33%'
  return '0%'
}

export function crearDwell({
  dwellMs = DWELL_MS,
  graciaMs = GRACIA_MS,
  puedeEnfocar = () => true,
  onInicio = () => {},
  onProgreso = () => {},
  onEtapa = () => {},
  onConfirmar = () => {},
  onCancelar = () => {},
  ahora = () => performance.now(),
  pedirFrame = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16)),
  cancelarFrame = (id) => (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id)),
} = {}) {
  let activo = null
  let inicio = 0
  let frame = null
  let gracia = null
  let etapa = '0%'

  function detenerFrame() {
    if (frame !== null) cancelarFrame(frame)
    frame = null
  }

  function limpiarGracia() {
    if (gracia !== null) clearTimeout(gracia)
    gracia = null
  }

  function tick() {
    if (!activo) return
    const transcurrido = ahora() - inicio
    const progreso = Math.min(transcurrido / dwellMs, 1)
    const nueva = etapaDe(progreso)
    if (nueva !== etapa) {
      etapa = nueva
      onEtapa(nueva, activo, transcurrido)
    }
    onProgreso(progreso, nueva, activo)
    if (progreso >= 1) {
      const objetivo = activo
      activo = null
      frame = null
      onConfirmar(objetivo)
    } else {
      frame = pedirFrame(tick)
    }
  }

  function cancelar() {
    limpiarGracia()
    detenerFrame()
    if (!activo) return
    const objetivo = activo
    const transcurrido = Math.round(ahora() - inicio)
    activo = null
    etapa = '0%'
    onCancelar(objetivo, transcurrido)
  }

  return {
    get activo() { return activo },
    /** La mirada entró (o sigue) sobre `objetivo`. */
    enfocar(objetivo) {
      limpiarGracia()
      if (!objetivo || !puedeEnfocar(objetivo)) return false
      if (activo && activo.key === objetivo.key) return true // misma carga en curso
      if (activo) cancelar()
      activo = objetivo
      inicio = ahora()
      etapa = '0%'
      onInicio(objetivo)
      onProgreso(0, '0%', objetivo)
      frame = pedirFrame(tick)
      return true
    },
    /** La mirada salió: cancela tras el margen de gracia, salvo que vuelva antes. */
    desenfocar() {
      if (!activo || gracia !== null) return
      gracia = setTimeout(() => { gracia = null; cancelar() }, graciaMs)
    },
    cancelar,
  }
}
