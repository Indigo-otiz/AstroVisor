/** Interfaz de lectura separada de las vistas. Se podrá cambiar el origen sin rehacer la UI. */
export async function cargarRecorridos({ signal } = {}) {
  const respuesta = await fetch('/api/contenidos/recorridos', {
    credentials: 'same-origin',
    signal,
  })
  if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`)
  const datos = await respuesta.json()
  if (!Array.isArray(datos)) throw new Error('Respuesta de recorridos inválida')
  const ids = new Set()
  for (const recorrido of datos) {
    if (
      !recorrido ||
      !['id', 'titulo', 'resumen', 'historia', 'comoReconocerla'].every(
        (campo) => typeof recorrido[campo] === 'string' && recorrido[campo].trim().length > 0,
      ) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recorrido.id) ||
      typeof recorrido.demostracion !== 'boolean' ||
      !Array.isArray(recorrido.libros) ||
      !Array.isArray(recorrido.multimedia) ||
      ids.has(recorrido.id)
    )
      throw new Error('Ficha de constelación inválida')
    ids.add(recorrido.id)
  }
  return datos
}
