/** Reproductor compartido por Vue y la página independiente del visor. */
const audiosPublicados = new WeakSet()
export function registrarAudioPublicado(audio) {
  if (!audio?.src?.startsWith('blob:')) throw new Error('Audio publicado inválido')
  const registrado = Object.freeze({ ...audio })
  audiosPublicados.add(registrado)
  return registrado
}
export function audioDe(recorrido) {
  return recorrido?.multimedia?.find((item) =>
    item?.tipo === 'audio' &&
    (/^\/audio\/[a-z0-9-]+\.(wav|mp3|m4a|ogg)$/.test(item.src) || audiosPublicados.has(item)) &&
    ['transcripcion', 'autorTexto', 'voz', 'procedencia', 'permiso'].every(
      (campo) => typeof item[campo] === 'string' && item[campo].trim(),
    ),
  ) ?? null
}

export function crearNarrador({ media = new Audio(), ventana = globalThis.window, documento = globalThis.document } = {}) {
  media.preload = 'metadata'
  let recurso = null
  let estado = 'no-disponible'
  let mensaje = 'Audio no disponible. Puedes leer la historia.'
  let activacion = ''
  let generacion = 0
  let intencion = false
  let preparando = false
  let destruido = false
  const observadores = new Set()
  const listeners = []
  const snapshot = () => ({
    estado, mensaje, activacion, recurso,
    posicion: Number.isFinite(media.currentTime) ? media.currentTime : 0,
    duracion: Number.isFinite(media.duration) ? media.duration : 0,
    puedeEscuchar: !!recurso && !['cargando', 'reproduciendo', 'pausado'].includes(estado),
    puedePausar: !preparando && ['cargando', 'reproduciendo'].includes(estado),
    puedeReanudar: !!recurso && estado === 'pausado',
  })
  const publicar = () => { if (!destruido) observadores.forEach((fn) => fn(snapshot())) }
  function cambiar(nuevo, texto) { estado = nuevo; mensaje = texto; publicar() }
  function reiniciar() { try { media.currentTime = 0 } catch { /* Aún sin metadatos. */ } }
  function cancelar({ recargar = false } = {}) {
    generacion++
    intencion = false
    preparando = false
    media.pause()
    if (recargar) media.load() // Aborta play/carga pendientes sobre el mismo elemento.
  }
  function detener() {
    if (destruido) return
    cancelar({ recargar: true })
    reiniciar()
    cambiar(recurso ? 'listo' : 'no-disponible', recurso ? 'Lista para escuchar desde el inicio.' : 'Audio no disponible. Puedes leer la historia.')
  }
  function seleccionar(nuevo) {
    if (destruido) return
    cancelar()
    recurso = nuevo
    activacion = ''
    reiniciar()
    if (recurso) media.src = recurso.src
    else media.removeAttribute('src')
    media.load()
    cambiar(recurso ? 'listo' : 'no-disponible', recurso ? 'Escucha la historia a tu ritmo.' : 'Audio no disponible. Puedes leer la historia.')
  }
  function fallo(error) {
    intencion = false
    preparando = false
    media.pause()
    if (error?.name === 'NotAllowedError') {
      cambiar('bloqueado', 'El navegador bloqueó el audio. Toca Activar audio o Escuchar y vuelve a intentarlo.')
    } else {
      cambiar('error', 'No pudimos reproducir el audio. Puedes leer la historia o volver a intentar con Escuchar.')
    }
  }
  // play() se invoca sin esperar ninguna tarea asíncrona: conserva el gesto real.
  function reproducir({ continuar = false, activar = false } = {}) {
    if (destruido || !recurso) return Promise.resolve(false)
    cancelar()
    if (!continuar || activar || media.ended) reiniciar()
    if (media.error) media.load()
    const turno = ++generacion
    intencion = true
    preparando = activar
    cambiar('cargando', activar ? 'Preparando el audio…' : 'Cargando narración…')
    let resultado
    try { resultado = media.play() } catch (error) { fallo(error); return Promise.resolve(false) }
    return Promise.resolve(resultado).then(() => {
      if (destruido || turno !== generacion) {
        // Nunca pausar la reproducción nueva al resolverse un play anterior.
        if (!intencion) { media.pause(); reiniciar() }
        return false
      }
      if (activar) {
        intencion = false
        preparando = false
        media.pause()
        reiniciar()
        activacion = 'Audio preparado. Selecciona Escuchar; si se bloquea, toca el control de nuevo.'
        cambiar('listo', 'Lista para escuchar desde el inicio.')
      } else if (!media.paused) {
        cambiar('reproduciendo', 'Reproduciendo narración.')
      }
      return true
    }).catch((error) => {
      if (!destruido && turno === generacion) fallo(error)
      return false
    })
  }
  function pausar() {
    if (destruido || !intencion || preparando) return
    cancelar()
    cambiar('pausado', 'Narración en pausa. Reanudar continúa donde la dejaste.')
  }
  function on(objeto, nombre, fn) {
    objeto?.addEventListener(nombre, fn)
    listeners.push(() => objeto?.removeEventListener(nombre, fn))
  }
  on(media, 'playing', () => {
    if (!intencion || destruido) { media.pause(); return }
    if (!preparando) cambiar('reproduciendo', 'Reproduciendo narración.')
  })
  on(media, 'waiting', () => { if (intencion && !preparando) cambiar('cargando', 'Cargando narración…') })
  on(media, 'ended', () => {
    if (!intencion || !media.ended || preparando) return
    intencion = false
    generacion++
    cambiar('finalizado', 'Narración finalizada. Puedes escucharla de nuevo.')
  })
  on(media, 'error', () => {
    if (recurso && media.error && !destruido) { generacion++; fallo(media.error) }
  })
  on(media, 'pause', () => {
    if (intencion && !preparando && estado === 'reproduciendo' && media.paused && !media.ended) {
      cancelar()
      cambiar('pausado', 'Narración en pausa. Reanudar continúa donde la dejaste.')
    }
  })
  on(media, 'timeupdate', publicar)
  on(media, 'loadedmetadata', publicar)
  on(ventana, 'pagehide', detener)
  on(documento, 'visibilitychange', () => { if (documento.hidden) pausar() })
  return {
    seleccionar, detener, pausar,
    escuchar: () => reproducir(),
    reanudar: () => reproducir({ continuar: true }),
    activar: () => reproducir({ activar: true }),
    snapshot,
    observar(fn) { observadores.add(fn); fn(snapshot()); return () => observadores.delete(fn) },
    destruir() {
      if (destruido) return
      detener()
      destruido = true
      listeners.forEach((quitar) => quitar())
      observadores.clear()
      media.removeAttribute('src')
      media.load()
    },
  }
}
