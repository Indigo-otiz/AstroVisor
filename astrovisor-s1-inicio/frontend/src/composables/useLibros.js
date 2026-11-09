import { ref } from 'vue'
import { listarLibros } from '../services/librosDemoService.js'

export function useLibros() {
  const libros = ref([]), cargando = ref(false), error = ref('')
  let solicitud
  async function cargar(id) {
    solicitud?.abort()
    const actual = solicitud = new AbortController()
    cargando.value = true; error.value = ''; libros.value = []
    try {
      const datos = await listarLibros(id, { signal: actual.signal })
      if (!actual.signal.aborted) libros.value = datos
    } catch {
      if (!actual.signal.aborted) error.value = 'No pudimos consultar los libros. Revisa la conexión y vuelve a intentar; no estamos mostrando una copia antigua.'
    } finally { if (!actual.signal.aborted) cargando.value = false }
  }
  function cancelar() { solicitud?.abort(); cargando.value = false }
  return { libros, cargando, error, cargar, cancelar }
}
