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
      // Fallback para entornos de demostración estáticos (p.ej. Vercel) sin backend activo
      try {
        const respDemo = await fetch('/prueba-homido/data/recorridos-demo.json', { signal: actual.signal })
        if (respDemo.ok) {
          const datosDemo = await respDemo.json()
          if (Array.isArray(datosDemo) && datosDemo.length > 0 && !actual.signal.aborted) {
            recorridos.value = datosDemo
            return
          }
        }
      } catch {
        // Si el respaldo tampoco responde, se presenta el mensaje de error normal
      }

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
