/* Modo de diagnóstico TEMPORAL: solo existe con ?diag=1 en la URL. Sin ese parámetro nada de este archivo actúa.
   Aísla efectos visuales sin tocar la experiencia normal y deja un registro (errores, canvas, DPR, estéreo, cuadros/s).
   Cada opción se puede fijar en la URL para repetir la prueba en el iPhone (ver docs/PRUEBA-S3-HOMIDO.md). */

export const OPCIONES = {
  estrellas: 'Estrellas de fondo (todas)',
  resplandor: 'Resplandor de la Vía Láctea (aditivo)',
  parpadeo: 'Parpadeo (shader)',
  horizonte: 'Cielo degradado, suelo y colinas',
  constelaciones: 'Constelaciones',
  mirilla: 'Mirilla',
  tactil: 'Arrastre táctil de cámara',
  sensores: 'Sensores de movimiento (cámara)',
}
export const DPR_OPCIONES = ['nativo', '1', '1.5', '2']

/** `off` = opciones apagadas (separadas por coma), `aa=0` = sin antialiasing (requiere recarga), `dpr` = tope de densidad. */
export function leerParametros(busqueda) {
  const q = new URLSearchParams(busqueda)
  if (q.get('diag') !== '1') return { activo: false, apagado: new Set(), aa: true, dpr: null }
  const dpr = parseFloat(q.get('dpr'))
  return {
    activo: true,
    apagado: new Set((q.get('off') || '').split(',').map((s) => s.trim()).filter((s) => s in OPCIONES)),
    aa: q.get('aa') !== '0',
    dpr: dpr > 0 && dpr <= 4 ? dpr : null,
  }
}

export function aBusqueda({ apagado, aa, dpr }) {
  const q = new URLSearchParams({ diag: '1' })
  if (apagado.size) q.set('off', [...apagado].join(','))
  if (!aa) q.set('aa', '0')
  if (dpr) q.set('dpr', String(dpr))
  return '?' + q.toString()
}

export function iniciarDiagnostico({ scene, log }) {
  const cfg = leerParametros(location.search)
  const aaReal = scene.renderer ? !!scene.renderer.getContext().getContextAttributes().antialias : null
  const errores = new Map()
  const anotar = (msg) => { const n = (errores.get(msg) || 0) + 1; errores.set(msg, n); if (n === 1) log(`[diag] ERROR JS: ${msg}`) }
  window.addEventListener('error', (e) => anotar(`${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`))
  window.addEventListener('unhandledrejection', (e) => anotar(`promesa rechazada: ${e.reason && e.reason.message || e.reason}`))
  const consolaError = console.error
  console.error = (...a) => { anotar(`console.error: ${a.map(String).join(' ').slice(0, 160)}`); consolaError.apply(console, a) }

  const $$ = (s) => scene.querySelector(s)
  const campo = () => $$('[campo-estelar]')
  const rig = () => document.getElementById('cameraRig')
  const aplicar = {
    estrellas: (on) => { const c = campo(); if (c) c.object3D.visible = on },
    resplandor: (on) => { const g = campo()?.getObject3D('estrellas'); const r = g && g.getObjectByName('resplandor'); if (r) r.visible = on },
    parpadeo: (on) => { const c = campo()?.components['campo-estelar']; if (c) c.uParpadeo.value = on ? 1 : 0 },
    horizonte: (on) => { const h = $$('[horizonte-nocturno]'); if (h) h.object3D.visible = on },
    constelaciones: (on) => { const c = document.getElementById('constelaciones'); if (c) c.object3D.visible = on },
    mirilla: (on) => { const m = document.getElementById('reticleGroup'); if (m) m.object3D.visible = on },
    tactil: (on) => rig()?.setAttribute('look-controls', 'touchEnabled', on),
    sensores: (on) => rig()?.setAttribute('look-controls', 'magicWindowTrackingEnabled', on),
  }
  const aplicarTodo = () => {
    for (const k of Object.keys(OPCIONES)) aplicar[k](!cfg.apagado.has(k))
    if (cfg.dpr && scene.renderer) { scene.renderer.setPixelRatio(Math.min(cfg.dpr, window.devicePixelRatio)); scene.resize && scene.resize() }
  }
  const sincronizarURL = () => history.replaceState(null, '', location.pathname + aBusqueda(cfg) + location.hash)

  // Panel (solo visible en la vista normal; en vista dividida se consulta el registro al salir)
  const panel = document.createElement('details')
  panel.className = 'diag-panel'
  panel.open = true
  panel.innerHTML = '<summary>Diagnóstico (?diag=1)</summary>'
  const estadoEl = document.createElement('pre')
  const urlEl = document.createElement('input')
  urlEl.readOnly = true
  const recargar = document.createElement('button')
  recargar.type = 'button'
  recargar.textContent = 'Recargar con esta configuración (antialiasing)'
  recargar.hidden = true
  recargar.onclick = () => location.reload()
  const refrescarURL = () => { urlEl.value = location.origin + location.pathname + aBusqueda(cfg) }

  for (const [k, texto] of Object.entries(OPCIONES)) {
    const l = document.createElement('label')
    const c = document.createElement('input')
    c.type = 'checkbox'
    c.checked = !cfg.apagado.has(k)
    c.onchange = () => {
      if (c.checked) cfg.apagado.delete(k); else cfg.apagado.add(k)
      aplicar[k](c.checked); sincronizarURL(); refrescarURL()
      log(`[diag] ${texto}: ${c.checked ? 'ENCENDIDO' : 'APAGADO'}`)
    }
    l.append(c, ' ' + texto)
    panel.append(l)
  }
  const lAA = document.createElement('label')
  const cAA = document.createElement('input')
  cAA.type = 'checkbox'
  cAA.checked = cfg.aa
  cAA.onchange = () => { cfg.aa = cAA.checked; sincronizarURL(); refrescarURL(); recargar.hidden = cfg.aa === (aaReal !== false) }
  lAA.append(cAA, ` Antialiasing WebGL (requiere recarga; actual: ${aaReal === null ? '?' : aaReal ? 'sí' : 'no'})`)
  const lD = document.createElement('label')
  const sD = document.createElement('select')
  DPR_OPCIONES.forEach((o) => { const op = new Option(o === 'nativo' ? 'Densidad de píxeles: nativa' : `Densidad de píxeles: tope ${o}`, o); op.selected = (cfg.dpr ? String(cfg.dpr) : 'nativo') === o; sD.add(op) })
  sD.onchange = () => {
    cfg.dpr = sD.value === 'nativo' ? null : parseFloat(sD.value)
    scene.renderer.setPixelRatio(cfg.dpr ? Math.min(cfg.dpr, window.devicePixelRatio) : window.devicePixelRatio)
    scene.resize && scene.resize(); sincronizarURL(); refrescarURL()
    log(`[diag] Densidad de píxeles: ${scene.renderer.getPixelRatio()}`)
  }
  lD.append(sD)
  panel.append(lAA, lD, recargar, estadoEl, urlEl)
  document.body.append(panel)
  refrescarURL()

  // Métricas aproximadas
  let cuadros = 0, t0 = performance.now(), render0 = 0
  const contar = () => { cuadros++; requestAnimationFrame(contar) }
  requestAnimationFrame(contar)
  const fotografia = () => {
    const r = scene.renderer
    if (!r) return null
    const ahora = performance.now()
    const seg = (ahora - t0) / 1000
    const rf = r.info.render.frame
    const m = {
      cuadrosPorSeg: +(cuadros / seg).toFixed(1),
      rendersPorCuadro: +((rf - render0) / Math.max(1, cuadros)).toFixed(2),
      canvasPx: `${r.domElement.width}x${r.domElement.height}`,
      dprVentana: window.devicePixelRatio,
      dprRenderer: r.getPixelRatio(),
      estereo: !!scene.components['experimental-stereo']?.enabledStereo,
      antialias: !!r.getContext().getContextAttributes().antialias,
      geometrias: r.info.memory.geometries,
      texturas: r.info.memory.textures,
      erroresJS: [...errores.values()].reduce((a, b) => a + b, 0),
    }
    cuadros = 0; t0 = ahora; render0 = rf
    return m
  }
  const gpu = () => {
    const gl = scene.renderer.getContext()
    const e = gl.getExtension('WEBGL_debug_renderer_info')
    return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : '(oculto por el navegador)'
  }
  const arrancar = () => {
    log(`[diag] GPU: ${gpu()} | ${gl_version()} | pantalla ${screen.width}x${screen.height} | ventana ${innerWidth}x${innerHeight}`)
    log(`[diag] Configuración inicial: ${aBusqueda(cfg)}`)
    fotografia()
    let n = 0
    setInterval(() => {
      const m = fotografia()
      if (!m) return
      estadoEl.textContent = `${m.cuadrosPorSeg} cuadros/s · ${m.rendersPorCuadro} renders/cuadro · canvas ${m.canvasPx}\nDPR ventana ${m.dprVentana} / renderer ${m.dprRenderer} · estéreo ${m.estereo ? 'sí' : 'no'} · AA ${m.antialias ? 'sí' : 'no'}\ngeometrías ${m.geometrias} · texturas ${m.texturas} · errores JS ${m.erroresJS}`
      if (++n % 5 === 0) log(`[diag] ${JSON.stringify(m)}`)
    }, 1000)
  }
  const gl_version = () => scene.renderer.getContext().getParameter(scene.renderer.getContext().VERSION)

  // Espera a que existan el renderer y los componentes del cielo antes de aplicar la configuración inicial
  const espera = setInterval(() => {
    const c = campo()?.components['campo-estelar']
    if (!scene.renderer || !c || !c.grupo || !$$('[horizonte-nocturno]')?.getObject3D('horizonte')) return
    clearInterval(espera)
    aplicarTodo()
    arrancar()
  }, 250)
}
