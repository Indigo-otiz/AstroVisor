import { ref, computed, watch } from 'vue'
import { cargarCatalogoAdmin, guardarLibro, guardarRecorrido, crearLibro, previsualizarPortada, prepararImagen } from '../services/catalogoAdminService.js'

// Solo memoria de esta pestaña: se pierde al recargar o cerrar, sin tokens ni contraseñas.
const pendiente = ref(null)
export const hayBorradorPendiente = computed(() => Boolean(pendiente.value))
export function descartarBorradorPendiente() { pendiente.value = null }

export function useEditorCatalogo({ obtenerToken, obtenerUsuario = () => '', alExpirarSesion = () => {} }) {
  const catalogo = ref(null), etag = ref(null), seleccion = ref(null), borrador = ref(null)
  const cargando = ref(false), guardando = ref(false), error = ref(''), mensaje = ref('')
  const conflicto = ref(false), necesitaRecarga = ref(false), sesionExpirada = ref(false)
  const previsualizacion = ref(''), previsualizando = ref(false)
  const libroActual = computed(() => seleccion.value?.tipo === 'libro' ? catalogo.value?.libros.find((l) => l.id === seleccion.value.id) : null)
  const recorridoActual = computed(() => seleccion.value?.tipo === 'recorrido' ? catalogo.value?.recorridos.find((r) => r.id === seleccion.value.id) : null)
  const puedeEditarTexto = computed(() => borrador.value?.tipoPortada !== 'heredada')
  const portadaCambiada = computed(() => seleccion.value?.tipo === 'nuevo' || (borrador.value && seleccion.value?.tipo === 'libro' && (borrador.value.tipoPortada !== (libroActual.value.portada?.tipo ?? 'heredada') || JSON.stringify(borrador.value.portada) !== JSON.stringify(libroActual.value.portada ?? {}))))
  const requierePreview = computed(() => borrador.value?.tipoPortada === 'ilustrativa' && (portadaCambiada.value || borrador.value.titulo !== libroActual.value?.titulo || borrador.value.autor !== libroActual.value?.autor))
  let solicitud, previewSolicitud, activo = true
  function limpiarPreview() {
    previewSolicitud?.abort(); previsualizando.value = false
    if (previsualizacion.value) URL.revokeObjectURL(previsualizacion.value)
    previsualizacion.value = ''
  }
  const detenerPreview = watch(() => [borrador.value?.titulo, borrador.value?.autor, borrador.value?.portada?.plantilla, borrador.value?.portada?.paleta], () => { if(borrador.value?.tipoPortada !== 'imagen-autorizada')limpiarPreview() }, { flush: 'sync' })
  const detenerModo=watch(()=>[borrador.value,borrador.value?.tipoPortada],([b,tipo],[anterior,antes])=>{
    if(b!==anterior||!tipo||!antes||tipo===antes)return
    limpiarPreview()
    borrador.value.portada=tipo==='ilustrativa'?{tipo:'ilustrativa',plantilla:'cielo',paleta:'azul'}:tipo==='imagen-autorizada'?{tipo,procedencia:'',permiso:'',textoAlternativo:''}:{}
  },{flush:'sync'})
  function descartar() { limpiarPreview(); seleccion.value = null; borrador.value = null; conflicto.value = false }
  function fallo(e) {
    error.value = e.message
    if (e.status === 412) conflicto.value = true
    if (e.status === 401 && !sesionExpirada.value) {
      if (borrador.value && !necesitaRecarga.value && obtenerUsuario()) pendiente.value = {
        usuario: obtenerUsuario(), seleccion: { ...seleccion.value }, etag: etag.value,
        datos: JSON.parse(JSON.stringify(borrador.value)),
      }
      sesionExpirada.value = true; alExpirarSesion()
    }
  }
  async function cargar() {
    if (!activo || guardando.value || sesionExpirada.value) return false
    solicitud?.abort()
    const actual = solicitud = new AbortController()
    cargando.value = true; error.value = ''; mensaje.value = ''
    try {
      const respuesta = await cargarCatalogoAdmin({ token: obtenerToken(), signal: actual.signal })
      if (actual.signal.aborted) return false
      catalogo.value = respuesta.catalogo; etag.value = respuesta.etag; necesitaRecarga.value = false; descartar()
      if (pendiente.value && pendiente.value.usuario !== obtenerUsuario()) descartarBorradorPendiente()
      return true
    } catch (e) { if (!actual.signal.aborted) fallo(e); return false }
    finally { if (!actual.signal.aborted) cargando.value = false }
  }
  function seleccionarLibro(id) {
    if (cargando.value || guardando.value || borrador.value || necesitaRecarga.value || sesionExpirada.value) return
    const libro = catalogo.value?.libros.find((l) => l.id === id)
    if (!libro) return
    seleccion.value = { tipo: 'libro', id }; error.value = ''; mensaje.value = ''
    borrador.value = { titulo:libro.titulo,autor:libro.autor,tipoPortada:libro.portada?.tipo ?? 'heredada',portada:JSON.parse(JSON.stringify(libro.portada ?? {})),anio: libro.anio ?? '', enlacePublico: libro.enlacePublico,
      relaciones: catalogo.value.recorridos.flatMap((r) => {
        const ref = r.libroRefs.find((v) => v.libroId === id)
        return ref ? [{ constelacionId: r.id, motivo: ref.motivo }] : []
      }) }
  }
  function seleccionarRecorrido(id) {
    if (cargando.value || guardando.value || borrador.value || necesitaRecarga.value || sesionExpirada.value) return
    const r = catalogo.value?.recorridos.find((v) => v.id === id)
    if (!r) return
    seleccion.value = { tipo: 'recorrido', id }; error.value = ''; mensaje.value = ''
    borrador.value = { resumen: r.resumen, comoReconocerla: r.comoReconocerla }
  }
  function nuevoLibro() {
    if (!activo || !catalogo.value || cargando.value || guardando.value || borrador.value || necesitaRecarga.value || sesionExpirada.value) return
    seleccion.value = { tipo: 'nuevo', id: '' }; error.value = ''; mensaje.value = ''
    borrador.value = { id: '', titulo: '', autor: '', anio: '', enlacePublico: '',tipoPortada:'ilustrativa', portada: { tipo: 'ilustrativa', plantilla: 'cielo', paleta: 'azul' },
      relaciones: catalogo.value.recorridos.map((r) => ({ constelacionId: r.id, seleccionada: false, motivo: '' })) }
  }
  async function previsualizar() {
    if (!activo || !borrador.value || borrador.value.tipoPortada !== 'ilustrativa' || cargando.value || guardando.value || conflicto.value || sesionExpirada.value) return false
    limpiarPreview()
    const actual = previewSolicitud = new AbortController()
    previsualizando.value = true; error.value = ''
    try {
      const b = borrador.value
      const blob = await previsualizarPortada({ titulo: b.titulo, autor: b.autor, portada: { tipo:'ilustrativa',plantilla:b.portada.plantilla,paleta:b.portada.paleta } }, { token: obtenerToken(), etag: etag.value, signal: actual.signal })
      if (actual.signal.aborted || !activo) return false
      previsualizacion.value = URL.createObjectURL(blob)
      return true
    } catch (e) { if (!actual.signal.aborted) fallo(e); return false }
    finally { if (!actual.signal.aborted) previsualizando.value = false }
  }
  async function subirImagen(file) {
    if(!activo||!borrador.value||borrador.value.tipoPortada!=='imagen-autorizada'||cargando.value||guardando.value||conflicto.value||sesionExpirada.value)return false
    limpiarPreview();const actual=previewSolicitud=new AbortController()
    previsualizando.value=true;error.value=''
    try{
      const r=await prepararImagen(file,{token:obtenerToken(),etag:etag.value,signal:actual.signal})
      if(actual.signal.aborted||!activo)return false
      borrador.value.portada={...borrador.value.portada,...r.recurso}
      previsualizacion.value=URL.createObjectURL(r.blob)
      mensaje.value='Imagen preparada; el libro aún no se ha guardado.'
      return true
    }catch(e){if(!actual.signal.aborted)fallo(e);return false}
    finally{if(!actual.signal.aborted)previsualizando.value=false}
  }
  function cancelarEdicion() { if (!guardando.value && !cargando.value) { descartar(); error.value = '' } }
  function recuperarBorrador() {
    const p = pendiente.value
    if (!p || !obtenerToken() || p.usuario !== obtenerUsuario() || !catalogo.value || cargando.value || guardando.value || borrador.value || necesitaRecarga.value || sesionExpirada.value) return false
    if (p.seleccion.tipo === 'nuevo') nuevoLibro()
    else if (p.seleccion.tipo === 'libro') seleccionarLibro(p.seleccion.id)
    else seleccionarRecorrido(p.seleccion.id)
    if (!borrador.value) { error.value = 'La ficha del borrador ya no está disponible.'; return false }
    borrador.value = JSON.parse(JSON.stringify(p.datos))
    conflicto.value = p.etag !== etag.value
    mensaje.value = 'Borrador recuperado en memoria; no se ha enviado al servidor. Revisa los campos antes de guardar.'
    if (conflicto.value) error.value = 'La revisión cambió durante tu ausencia. Copia tu borrador antes de recargar; no se puede guardar sobre esta versión.'
    descartarBorradorPendiente()
    return true
  }
  async function guardar() {
    if (!activo || !borrador.value || cargando.value || guardando.value || conflicto.value || necesitaRecarga.value || sesionExpirada.value) return false
    if (previsualizando.value || (requierePreview.value && !previsualizacion.value) || (seleccion.value.tipo === 'nuevo' && !borrador.value.relaciones.some((r) => r.seleccionada))) { error.value = 'Selecciona al menos una constelación y previsualiza la portada antes de guardar.'; return false }
    if(borrador.value.tipoPortada==='imagen-autorizada'&&(!borrador.value.portada.recursoId||!['procedencia','permiso','textoAlternativo'].every(k=>borrador.value.portada[k]?.trim()))){error.value='Prepara una imagen e indica procedencia, permiso y texto alternativo.';return false}
    if (libroActual.value?.anio !== undefined && borrador.value.anio === '') { error.value = 'Indica el año; este formulario no permite eliminarlo.'; return false }
    const { tipo, id } = seleccion.value
    const b = borrador.value
    const portada=b.tipoPortada==='ilustrativa'?{tipo:'ilustrativa',plantilla:b.portada.plantilla,paleta:b.portada.paleta}:b.portada
    const datos = tipo === 'nuevo' ? { id: b.id, titulo: b.titulo, autor: b.autor, anio: Number(b.anio), enlacePublico: b.enlacePublico, portada: { ...portada },
      relaciones: b.relaciones.filter((r) => r.seleccionada).map(({ constelacionId, motivo }) => ({ constelacionId, motivo })) } : tipo === 'libro' ? { ...(borrador.value.anio === '' ? {} : { anio: Number(borrador.value.anio) }),
      enlacePublico: borrador.value.enlacePublico, relaciones: borrador.value.relaciones.map((r) => ({ constelacionId: r.constelacionId, motivo: r.motivo })) }
      : { resumen: borrador.value.resumen, comoReconocerla: borrador.value.comoReconocerla }
    if(tipo==='libro'){
      for(const k of ['titulo','autor'])if(b[k]!==libroActual.value[k])datos[k]=b[k]
      if(portadaCambiada.value)datos.portada={...portada}
    }
    const actual = solicitud = new AbortController()
    guardando.value = true; error.value = ''; mensaje.value = ''
    let confirmado = false
    try {
      const opciones = { token: obtenerToken(), etag: etag.value, signal: actual.signal }
      const resultado = await (tipo === 'nuevo' ? crearLibro(datos, opciones) : (tipo === 'libro' ? guardarLibro : guardarRecorrido)(id, datos, opciones))
      if (actual.signal.aborted) return false
      confirmado = true; etag.value = resultado.etag
      mensaje.value = resultado.respaldoPublico === 'publicado' && resultado.revisionPublicada === resultado.revision
        ? `Guardado confirmado. Homido tiene publicada la revisión ${resultado.revisionPublicada}.`
        : `Guardado confirmado. El respaldo público de Homido sigue pendiente de sincronización.${resultado.revisionPublicada ? ` Copia publicada: revisión ${resultado.revisionPublicada}.` : ''}`
      if (resultado.durabilidadPendiente || resultado.retencionPendiente) mensaje.value += ' Hay un aviso operativo de almacenamiento; consulta al responsable del servidor.'
      const respuesta = await cargarCatalogoAdmin({ token: obtenerToken(), signal: actual.signal })
      if (actual.signal.aborted) return false
      catalogo.value = respuesta.catalogo; etag.value = respuesta.etag; descartar()
      return true
    } catch (e) {
      if (!actual.signal.aborted) {
        if (confirmado) necesitaRecarga.value = true
        fallo(e)
        if (confirmado) error.value = `Guardado confirmado, pero no pudimos recargar el catálogo. ${error.value}`
      }
      return false
    } finally { if (!actual.signal.aborted) guardando.value = false }
  }
  function cancelarPeticiones() { activo = false; solicitud?.abort(); limpiarPreview(); detenerPreview();detenerModo(); cargando.value = false; guardando.value = false }
  return { catalogo, etag, seleccion, borrador, cargando, guardando, error, mensaje, conflicto, necesitaRecarga, sesionExpirada,
    libroActual, recorridoActual, cargar, seleccionarLibro, seleccionarRecorrido, cancelarEdicion, guardar, cancelarPeticiones,
    hayBorradorPendiente, recuperarBorrador, descartarBorradorPendiente, nuevoLibro, previsualizar, previsualizacion, previsualizando,subirImagen,puedeEditarTexto,requierePreview }
}
