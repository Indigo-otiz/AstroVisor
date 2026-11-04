/** Adaptador de la estantería: reutiliza libros[] del contrato JSON/API existente.
 * MARC 21 es un formato de registro, no una signatura. Nunca se inventan registros 001/003.
 */
export function librosDeEstanteria(recorridos, constelacionPreferida = '') {
  if (!Array.isArray(recorridos)) return []
  const libros = recorridos.flatMap((recorrido) => {
    if (!recorrido || !Array.isArray(recorrido.libros)) return []
    return recorrido.libros
      .filter((libro) => libro && typeof libro.titulo === 'string' && libro.titulo.trim())
      .map((libro, indice) => ({
        id: `${recorrido.id}-${indice}`,
        constelacionId: recorrido.id,
        constelacionTitulo: recorrido.titulo,
        titulo: libro.titulo.trim(),
        autor: typeof libro.autor === 'string' ? libro.autor : 'Autor no indicado',
        anio: libro.anio,
        licencia: libro.licencia,
        aclaracion: libro.aclaracion,
        url: typeof libro.url === 'string' && /^https:\/\//i.test(libro.url) ? libro.url : null,
        catalogo: libro.catalogo ?? null,
        demostracion: true,
      }))
  })
  return libros.sort((a, b) =>
    Number(b.constelacionId === constelacionPreferida) - Number(a.constelacionId === constelacionPreferida)
  )
}

/** Muestra ubicaciones e identificadores solo si el catálogo los confirmó. */
export function datosLocalizacion(libro) {
  const registro = libro?.catalogo
  if (registro?.confirmadoBiblioteca !== true) {
    return { confirmado: false, ubicacion: null, signatura: null, numeroControl: null }
  }
  const numero = typeof registro.control001 === 'string' ? registro.control001.trim() : ''
  const agencia = typeof registro.agencia003 === 'string' ? registro.agencia003.trim() : ''
  return {
    confirmado: true,
    ubicacion: registro.ubicacion || null,
    signatura: registro.signatura || null,
    numeroControl: numero ? (agencia ? `${agencia}: ${numero}` : numero) : null,
  }
}
