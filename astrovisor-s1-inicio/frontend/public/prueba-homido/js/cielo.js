/* Cielo nocturno: estrellas de fondo en capas (brillos y tamaños variados, parpadeo leve en algunas), banda tipo
   Vía Láctea, degradado de cielo, suelo y tres crestas de colinas con perspectiva atmosférica. Pocas llamadas de dibujo.
   Determinista: la misma semilla produce el mismo cielo. Las constelaciones NO se mueven ni parpadean. */

const ALTURA_OJOS = 1.6 // m (igual que la cámara de la escena)

function aleatorio(semilla) { // mulberry32
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()) // N(0,1)
const norm = ([x, y, z]) => { const m = Math.hypot(x, y, z); return [x / m, y / m, z / m] }
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

export const NORMAL_BANDA = norm([0.35, 0.8, 0.5]) // polo del círculo máximo que forma la banda
const EJE_U = norm(cruz(NORMAL_BANDA, [0, 1, 0]))
const EJE_V = cruz(NORMAL_BANDA, EJE_U)

function sobreHorizonte(d) { return d[1] >= -0.05 }

/** Direcciones sobre la esfera, fuera de la banda (uniformes salvo por el azar). */
function direccionLibre(r) {
  for (;;) {
    const d = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]
    const l = Math.hypot(...d)
    if (l <= 0.001 || l > 1) continue
    const u = norm(d)
    if (sobreHorizonte(u)) return u
  }
}

/** Dirección dentro de la banda: perfil gaussiano de ≈8° y densidad irregular a lo largo del círculo. */
function direccionBanda(r, sigma) {
  for (;;) {
    const phi = r() * 2 * Math.PI
    const densidad = 0.25 + 0.75 * Math.abs(Math.sin(2.1 * phi + 0.7) * (0.65 + 0.35 * Math.sin(5.3 * phi + 1.9)))
    if (r() > densidad) continue
    const lat = gauss(r) * sigma
    const base = [
      Math.cos(phi) * EJE_U[0] + Math.sin(phi) * EJE_V[0],
      Math.cos(phi) * EJE_U[1] + Math.sin(phi) * EJE_V[1],
      Math.cos(phi) * EJE_U[2] + Math.sin(phi) * EJE_V[2],
    ]
    const d = norm([base[0] + NORMAL_BANDA[0] * lat, base[1] + NORMAL_BANDA[1] * lat, base[2] + NORMAL_BANDA[2] * lat])
    if (sobreHorizonte(d)) return d
  }
}

/** `banda` = fracción de estrellas que se concentra en la Vía Láctea. */
export function generarEstrellas(cantidad, { semilla = 7, banda = 0.3, sigma = 0.14 } = {}) {
  const r = aleatorio(semilla)
  return Array.from({ length: cantidad }, () => (r() < banda ? direccionBanda(r, sigma) : direccionLibre(r)))
}

/** Puntos para el resplandor difuso de la banda (más anchos que las estrellas). */
export function generarResplandor(cantidad, { semilla = 31 } = {}) {
  const r = aleatorio(semilla)
  return Array.from({ length: cantidad }, () => direccionBanda(r, 0.2))
}

/** Atenuación cerca del horizonte (extinción atmosférica): las estrellas bajas se ven más tenues. y = sen(elevación). */
export function extincion(y) {
  const t = Math.min(1, Math.max(0, y / 0.28))
  return 0.2 + 0.8 * t * t * (3 - 2 * t)
}

/** Brillo del cielo junto al horizonte: las colinas y el suelo se recortan contra él (siguen siendo más oscuros). */
export const COLOR_HORIZONTE = '#305b86'

/** Capas de relieve, de la más cercana (la más oscura) a la más lejana (algo más clara y desaturada: perspectiva atmosférica).
    `max` = elevación angular máxima de la cresta en grados (≈4° ≈ 21 px por ojo en un móvil); queda bajo las constelaciones.
    `color` = tono de la base; `cima` = tono de la cresta iluminada por la luna (se aplica según la inclinación de cada ladera);
    `niebla` = fracción en que la base se mezcla con el brillo del horizonte (bruma). Todas las cimas se mantienen más oscuras que el cielo. */
export const CAPAS_CRESTA = [
  { r: 15, color: '#050b16', cima: '#0b1626', niebla: 0.0, base: 2.2, amp: 2.6, f: [3, 7, 13], p: [0.4, 2.1, 5.0], max: 5.0 },
  { r: 26, color: '#08121f', cima: '#152842', niebla: 0.05, base: 1.9, amp: 2.2, f: [2, 5, 11], p: [1.7, 0.3, 3.3], max: 4.2 },
  { r: 38, color: '#112136', cima: '#213a58', niebla: 0.12, base: 1.6, amp: 2.0, f: [4, 6, 9], p: [3.0, 4.4, 1.2], max: 3.6 },
  { r: 50, color: '#1b3149', cima: '#2a4766', niebla: 0.2, base: 1.9, amp: 2.6, f: [2, 3, 7], p: [5.2, 1.0, 2.6], max: 4.3 },
]

/** Parámetros del paisaje (ajustables en el atributo `horizonte-nocturno` de la entidad):
    contraste = multiplicador del brillo de suelo y colinas (1 = actual; 1.3 más visible; 0.8 más discreto);
    relieve = amplitud del relieve del suelo en metros. */
export const PAISAJE = { contraste: 1, relieve: 0.2 }

/** Tonos del suelo: tierra fría, roca azulada y tierra cálida; mezcla por zonas. */
export const COLORES_SUELO = { tierra: '#0b1a2e', roca: '#1a2a3a', calida: '#262022' }

/** Elevación angular (grados) de la cresta de una capa en el azimut `az` (radianes). */
export function perfilCresta(az, capa) {
  const [f1, f2, f3] = capa.f
  const [p1, p2, p3] = capa.p
  const v = 0.5 * Math.sin(f1 * az + p1) + 0.3 * Math.sin(f2 * az + p2) + 0.2 * Math.sin(f3 * az + p3) // [-1, 1]
  return Math.min(capa.max, Math.max(0.25, capa.base + capa.amp * 0.5 * (v + 1) - capa.amp * 0.25))
}

export function registrarCielo(AFRAME) {
  AFRAME.registerComponent('campo-estelar', {
    init() {
      const THREE = AFRAME.THREE
      this.uTiempo = { value: 0 }
      this.uParpadeo = { value: 1 } // 0 apaga el titileo (solo lo usa el modo ?diag=1)
      // three.js ya multiplica el tamaño de punto por el pixelRatio: `size` va en píxeles CSS.
      const lienzo = document.createElement('canvas')
      lienzo.width = lienzo.height = 32
      const c2 = lienzo.getContext('2d')
      const grad = c2.createRadialGradient(16, 16, 0, 16, 16, 16)
      grad.addColorStop(0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.4, 'rgba(255,255,255,0.85)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      c2.fillStyle = grad
      c2.fillRect(0, 0, 32, 32)
      const redonda = new THREE.CanvasTexture(lienzo)

      // radio: capa de profundidad (las brillantes más cerca, las tenues más lejos); parpadeo: fracción de estrellas que titilan
      const nube = (dirs, semilla, { radio, tam, brillo, color, aditivo = false, opacidad = 1, parpadeo = 0, nombre = '' }) => {
        const r = aleatorio(semilla)
        const pos = new Float32Array(dirs.length * 3)
        const col = new Float32Array(dirs.length * 3)
        const fase = new Float32Array(dirs.length)
        const amp = new Float32Array(dirs.length)
        const vel = new Float32Array(dirs.length)
        dirs.forEach((d, i) => {
          pos.set([d[0] * radio, d[1] * radio, d[2] * radio], i * 3)
          const b = brillo * (0.4 + 0.6 * Math.pow(r(), 1.6)) * extincion(d[1]) // pocas brillantes, muchas tenues; más tenues cerca del horizonte
          const t = r() // temperatura: algunas azuladas, algunas cálidas
          col.set(color(b, t), i * 3)
          fase[i] = r() * 2 * Math.PI
          vel[i] = 1.2 + r() * 2.4 // rad/s: periodos de ≈2 a 5 s
          amp[i] = r() < parpadeo ? 0.15 + r() * 0.27 : 0 // titila hasta un 15–42 %; el resto es estable
        })
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        g.setAttribute('color', new THREE.BufferAttribute(col, 3))
        const m = new THREE.PointsMaterial({
          size: tam, map: redonda, transparent: true, opacity: opacidad, alphaTest: aditivo ? 0 : 0.05,
          sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false,
          blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
        })
        if (parpadeo > 0) {
          g.setAttribute('aFase', new THREE.BufferAttribute(fase, 1))
          g.setAttribute('aAmp', new THREE.BufferAttribute(amp, 1))
          g.setAttribute('aVel', new THREE.BufferAttribute(vel, 1))
          m.onBeforeCompile = (sh) => {
            sh.uniforms.uTiempo = this.uTiempo
            sh.uniforms.uParpadeo = this.uParpadeo
            sh.vertexShader = sh.vertexShader
              .replace('#include <common>', '#include <common>\nattribute float aFase;\nattribute float aAmp;\nattribute float aVel;\nuniform float uTiempo;\nuniform float uParpadeo;')
              .replace('#include <color_vertex>', '#include <color_vertex>\n#ifdef USE_COLOR\n  vColor.rgb *= 1.0 - uParpadeo * aAmp * (0.5 + 0.5 * sin(uTiempo * aVel + aFase));\n#endif')
          }
        }
        const p = new THREE.Points(g, m)
        p.frustumCulled = false
        p.name = nombre
        return p
      }
      const natural = (b, t) => (t < 0.2 ? [b * 0.82, b * 0.9, b] : t > 0.82 ? [b, b * 0.88, b * 0.72] : [b * 0.97, b * 0.97, b])
      const frio = (b) => [b * 0.78, b * 0.86, b]

      this.grupo = new THREE.Group()
      this.grupo.add(nube(generarResplandor(420, { semilla: 31 }), 5, { radio: 135, tam: 44, brillo: 0.9, color: frio, aditivo: true, opacidad: 0.02, nombre: 'resplandor' }))
      this.grupo.add(nube(generarEstrellas(620, { semilla: 11 }), 12, { radio: 125, tam: 2.2, brillo: 0.62, color: natural, parpadeo: 0.25 }))
      this.grupo.add(nube(generarEstrellas(170, { semilla: 23, banda: 0.2 }), 13, { radio: 85, tam: 3.4, brillo: 0.85, color: natural, parpadeo: 0.2 }))
      this.grupo.add(nube(generarEstrellas(34, { semilla: 47, banda: 0.1 }), 14, { radio: 55, tam: 5.2, brillo: 1, color: natural, parpadeo: 0.12 }))
      this.el.setObject3D('estrellas', this.grupo)
    },
    tick(time) { this.uTiempo.value = time / 1000 },
    remove() { this.el.removeObject3D('estrellas') },
  })

  // Degradado de cielo + suelo con relieve y variación de color + cuatro capas de colinas y montañas (sin objetos extra)
  AFRAME.registerComponent('horizonte-nocturno', {
    schema: { contraste: { default: PAISAJE.contraste }, relieve: { default: PAISAJE.relieve } },
    init() {
      const THREE = AFRAME.THREE
      const k = this.data.contraste
      const grupo = new THREE.Group()
      const mezcla = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), Math.min(1, Math.max(0, t)))
      const limitar = (v) => Math.min(1, Math.max(0, v))

      // Cúpula con degradado (más clara y azulada junto al horizonte, casi negra en el cenit)
      const cupula = new THREE.SphereGeometry(150, 32, 20)
      const pc = cupula.attributes.position
      const cc = new Float32Array(pc.count * 3)
      for (let i = 0; i < pc.count; i++) {
        const t = Math.max(0, pc.getY(i) / 150) // sen(elevación)
        const c = t < 0.2 ? mezcla(COLOR_HORIZONTE, '#0f2340', t / 0.2) : t < 0.5 ? mezcla('#0f2340', '#040b18', (t - 0.2) / 0.3) : mezcla('#040b18', '#02050c', (t - 0.5) / 0.5)
        cc.set([c.r, c.g, c.b], i * 3)
      }
      cupula.setAttribute('color', new THREE.BufferAttribute(cc, 3))
      const dom = new THREE.Mesh(cupula, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false }))
      dom.renderOrder = -10
      grupo.add(dom)

      // Suelo: anillo de ≈2 400 vértices con relieve suave, tres tonos mezclados por zonas, sombreado por altura y granulado leve
      const R = 16
      const suelo = new THREE.RingGeometry(0.2, R, 96, 24)
      suelo.rotateX(-Math.PI / 2)
      const ps = suelo.attributes.position
      const cs = new Float32Array(ps.count * 3)
      const relieve = (x, z) => 0.5 * Math.sin(x * 0.55 + 1.1) * Math.cos(z * 0.47 - 0.6) + 0.3 * Math.sin((x * 0.9 + z * 1.3) * 0.8 + 2) + 0.2 * Math.sin(x * 2.1) * Math.sin(z * 1.9) // [-1, 1]
      const zonas = (x, z) => 0.5 + 0.5 * (0.6 * Math.sin(x * 0.33 - z * 0.21 + 0.8) + 0.4 * Math.sin(z * 0.41 + x * 0.12 + 2.4)) // [0, 1]
      const grano = (x, z) => { const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return h - Math.floor(h) } // ruido determinista
      for (let i = 0; i < ps.count; i++) {
        const x = ps.getX(i)
        const z = ps.getZ(i)
        const d = Math.hypot(x, z) / R
        const h = relieve(x, z)
        ps.setY(i, this.data.relieve * h * limitar(d * 4) + 0.5 * d * d * d) // se eleva hacia el borde, donde enlaza con las colinas
        const z1 = zonas(x, z)
        const c = mezcla(COLORES_SUELO.tierra, COLORES_SUELO.roca, z1).lerp(new THREE.Color(COLORES_SUELO.calida), limitar((zonas(z * 1.7, x * 1.3) - 0.5) * 3))
        c.multiplyScalar((0.7 + 0.5 * (h + 1) / 2 + 0.3 * (grano(x, z) - 0.5)) * k)
        c.lerp(new THREE.Color(CAPAS_CRESTA[0].cima), limitar((d - 0.7) / 0.3) * 0.5) // enlaza con la primera colina
        cs.set([c.r, c.g, c.b], i * 3)
      }
      suelo.setAttribute('color', new THREE.BufferAttribute(cs, 3))
      suelo.computeBoundingSphere()
      grupo.add(new THREE.Mesh(suelo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })))

      // Colinas y montañas: muros anulares cuyo borde superior sigue el perfil de cada capa.
      // La cresta se ilumina según la inclinación de la ladera; la base se tiñe de bruma hacia el horizonte.
      const N = 144
      CAPAS_CRESTA.forEach((capa) => {
        const pos = new Float32Array((N + 1) * 2 * 3)
        const col = new Float32Array((N + 1) * 2 * 3)
        const idx = []
        const bruma = mezcla(capa.color, COLOR_HORIZONTE, capa.niebla).multiplyScalar(k)
        for (let i = 0; i <= N; i++) {
          const az = (i / N) * 2 * Math.PI
          const x = capa.r * Math.sin(az)
          const z = -capa.r * Math.cos(az)
          const top = ALTURA_OJOS + capa.r * Math.tan((perfilCresta(az, capa) * Math.PI) / 180)
          pos.set([x, top, z, x, -2, z], i * 6)
          const pendiente = perfilCresta(az + 0.03, capa) - perfilCresta(az - 0.03, capa) // laderas hacia la luna: más claras
          const cima = mezcla(capa.color, capa.cima, 0.35 + 0.65 * limitar(0.5 + pendiente * 1.5)).multiplyScalar(k)
          col.set([cima.r, cima.g, cima.b, bruma.r, bruma.g, bruma.b], i * 6)
          if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
        }
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        g.setAttribute('color', new THREE.BufferAttribute(col, 3))
        g.setIndex(idx)
        grupo.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false })))
      })
      this.el.setObject3D('horizonte', grupo)
    },
    remove() { this.el.removeObject3D('horizonte') },
  })
}
