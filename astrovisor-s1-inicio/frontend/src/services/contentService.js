/** Interfaz de lectura separada de las vistas. Se podrá cambiar el origen sin rehacer la UI. */
export async function cargarRecorridos() {
  const respuesta = await fetch('/api/contenidos/recorridos', { credentials: 'same-origin' })
  if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`)
  const datos = await respuesta.json()
  if (!Array.isArray(datos)) throw new Error('Respuesta de recorridos inválida')
  return datos
}
