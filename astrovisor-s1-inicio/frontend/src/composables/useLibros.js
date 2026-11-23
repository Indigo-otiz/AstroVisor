import { ref } from 'vue'
import { listarLibros } from '../services/librosDemoService.js'

export function useLibros() {
  const libros = ref([]), cargando = ref(false), error = ref(''), aviso = ref('')
  let solicitud, liberar
  async function cargar(id) {
    solicitud?.abort()
    liberar?.(); liberar = null; aviso.value = ''
    const actual = solicitud = new AbortController()
    cargando.value = true; error.value = ''; libros.value = []
    try {
      const datos = await listarLibros(id, { signal: actual.signal, alUsarRespaldo: carga => {
        if (actual.signal.aborted) { carga.liberar(); return }
        liberar = carga.liberar; aviso.value = carga.aviso
      } })
      if (!actual.signal.aborted) libros.value = datos
    } catch {
      // Fallback para entornos estáticos (p.ej. Vercel) sin backend Express activo
      try {
        const resp = await fetch('/prueba-homido/data/libros-demo.json', { signal: actual.signal })
        if (resp.ok) {
          const catalogo = await resp.json()
          if (Array.isArray(catalogo) && !actual.signal.aborted) {
            libros.value = catalogo
              .filter((l) => typeof l.recomendaciones?.[id] === 'string')
              .sort((a, b) => Number(a.demostracion) - Number(b.demostracion))
              .map((l) => ({ ...l, motivo: l.recomendaciones[id] }))
            return
          }
        }
      } catch {
        // Fallback no disponible, proceder al mensaje de error normal
      }

      if (!actual.signal.aborted) error.value = 'No pudimos consultar los libros. Revisa la conexión y vuelve a intentar; no estamos mostrando una copia antigua.'
    } finally { if (!actual.signal.aborted) cargando.value = false }
  }
  function cancelar() { solicitud?.abort(); liberar?.(); liberar = null; cargando.value = false }
  return { libros, cargando, error, aviso, cargar, cancelar }
}
