/* Estado de interacción del visor. Pausa = pausa de la SELECCIÓN POR MIRADA; no tiene relación
   con la pausa de la narración de audio (que corresponde al módulo de audio). */

export function crearEstado() {
  let modo = 'recorrido' // 'recorrido' | 'ficha'
  let pausado = false
  let fichaId = null

  return {
    get modo() { return modo },
    get pausado() { return pausado },
    get fichaId() { return fichaId },

    /** ¿Se puede ejecutar `accion` ahora? via: 'mirada' | 'clic'. */
    permitido(accion, via = 'mirada') {
      if (accion === 'salir' || accion === 'pausa') return true // siempre disponibles
      if (via === 'mirada' && pausado) return false
      if (accion === 'constelacion') return modo === 'recorrido'
      if (accion === 'volver' || accion === 'audio') return modo === 'ficha'
      return false
    },

    abrirFicha(id) {
      if (modo !== 'recorrido' || !id) return false
      modo = 'ficha'
      fichaId = id
      return true
    },

    volver() {
      if (modo !== 'ficha') return false
      modo = 'recorrido'
      fichaId = null
      return true
    },

    alternarPausa() {
      pausado = !pausado
      return pausado
    },
  }
}
