import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { cargarRecorridos } from '../services/contentService.js'

export function useRecorridos() {
  const recorridos = ref([])
  const cargando = ref(true)
  const error = ref('')
  let solicitud

  async function cargar() {
    solicitud?.abort()
    const actual = new AbortController()
    solicitud = actual
    cargando.value = true
    error.value = ''
    try {
      const datos = await cargarRecorridos({ signal: actual.signal })
      if (!actual.signal.aborted) recorridos.value = datos
    } catch {
      if (!actual.signal.aborted)
        error.value = 'No pudimos cargar las constelaciones. Inténtalo de nuevo en un momento.'
    } finally {
      if (!actual.signal.aborted) {
        cargando.value = false
        await nextTick()
        if (document.activeElement === document.body) {
          document.querySelector('#contenido h1')?.focus({ preventScroll: true })
        }
      }
    }
  }

  onMounted(cargar)
  onBeforeUnmount(() => solicitud?.abort())
  return { recorridos, cargando, error, cargar }
}
