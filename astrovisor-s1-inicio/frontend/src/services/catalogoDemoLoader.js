export async function cargarCatalogoDemo({ signal } = {}) {
  const [resRecorridos, resLibros] = await Promise.all([
    fetch('/prueba-homido/data/recorridos-demo.json', { signal }),
    fetch('/prueba-homido/data/libros-demo.json', { signal }),
  ])
  if (!resRecorridos.ok || !resLibros.ok) {
    throw new Error('No se pudieron cargar los datos de demostración.')
  }
  const recorridosData = await resRecorridos.json()
  const librosData = await resLibros.json()

  const fichas = recorridosData.map((recorrido) => {
    const libroRefs = librosData
      .filter((l) => l.recomendaciones && Object.hasOwn(l.recomendaciones, recorrido.id))
      .map((l) => ({
        libroId: l.id,
        motivo: l.recomendaciones[recorrido.id],
      }))
    return {
      id: recorrido.id,
      titulo: recorrido.titulo,
      resumen: recorrido.resumen,
      comoReconocerla: recorrido.comoReconocerla,
      historia: recorrido.historia,
      libroRefs,
    }
  })

  const catalogo = {
    schemaVersion: 1,
    revision: 1,
    publicacionHomido: {
      respaldoPublico: 'publicado',
      revisionPublicada: 1,
    },
    libros: JSON.parse(JSON.stringify(librosData)),
    recorridos: fichas,
  }

  return { catalogo, etag: '"catalogo-1"' }
}
