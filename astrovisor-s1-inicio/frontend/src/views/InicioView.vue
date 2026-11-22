<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'

const canvasRef = ref(null)
const mostrarModalVR = ref(false)

const starTooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  nombre: '',
  mag: '',
})

let animationFrameId = null
let cleanupListeners = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = 0
  let height = 0

  function resize() {
    const hero = canvas.parentElement
    width = canvas.width = hero ? hero.clientWidth : window.innerWidth
    height = canvas.height = hero ? hero.clientHeight : window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  const bgStars = Array.from({ length: 360 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.3,
    twinkleSpeed: 0.01 + Math.random() * 0.035,
    twinkleAngle: Math.random() * Math.PI * 2,
    moveSpeed: 0.015 + Math.random() * 0.04,
  }))

  const baseNodes = [
    { id: 'betelgeuse', name: 'Betelgeuse (α Ori)', mag: '0.50', color: '#ffb347', x: -160, y: -200, size: 4.8 },
    { id: 'bellatrix', name: 'Bellatrix (γ Ori)', mag: '1.64', color: '#b8e3ff', x: 170, y: -180, size: 3.2 },
    { id: 'alnitak', name: 'Alnitak (ζ Ori)', mag: '1.74', color: '#d8efff', x: -55, y: -10, size: 2.8 },
    { id: 'alnilam', name: 'Alnilam (ε Ori)', mag: '1.69', color: '#ffffff', x: 0, y: -5, size: 3.0 },
    { id: 'mintaka', name: 'Mintaka (δ Ori)', mag: '2.25', color: '#d8efff', x: 55, y: 0, size: 2.8 },
    { id: 'saiph', name: 'Saiph (κ Ori)', mag: '2.07', color: '#a6dbff', x: -140, y: 190, size: 3.0 },
    { id: 'rigel', name: 'Rigel (β Ori)', mag: '0.18', color: '#99d9ff', x: 180, y: 210, size: 4.5 },
    { id: 'meissa', name: 'Meissa (λ Ori)', mag: '3.35', color: '#f5c842', x: 5, y: -270, size: 2.2 },
    { id: 'nebula', name: 'Nebulosa M42', mag: '4.0', color: '#ff8fd8', x: -5, y: 70, size: 2.5 },
  ]

  const edges = [
    [0, 1], [0, 2], [1, 4], [2, 3], [3, 4],
    [2, 5], [4, 6], [5, 6], [0, 7], [1, 7], [3, 8],
  ]

  const scaleFactor = Math.min(width, height) / 820

  const constellationNodes = baseNodes.map((n) => {
    const ox = n.x * scaleFactor
    const oy = n.y * scaleFactor
    return {
      ...n,
      ox,
      oy,
      x: ox,
      y: oy,
      vx: 0,
      vy: 0,
      isDragging: false,
      angle: Math.random() * Math.PI * 2,
      wanderSpeed: 0.0006 + Math.random() * 0.001,
      wanderRadius: 2.5 + Math.random() * 4,
      screenX: 0,
      screenY: 0,
    }
  })

  const N = constellationNodes.length
  const distMatrix = Array.from({ length: N }, () => Array(N).fill(Infinity))
  for (let i = 0; i < N; i++) distMatrix[i][i] = 0
  edges.forEach(([u, v]) => {
    distMatrix[u][v] = 1
    distMatrix[v][u] = 1
  })
  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (distMatrix[i][k] + distMatrix[k][j] < distMatrix[i][j]) {
          distMatrix[i][j] = distMatrix[i][k] + distMatrix[k][j]
        }
      }
    }
  }

  const restDistances = edges.map(([i, j]) => {
    const dx = constellationNodes[i].ox - constellationNodes[j].ox
    const dy = constellationNodes[i].oy - constellationNodes[j].oy
    return Math.sqrt(dx * dx + dy * dy)
  })

  let globalRotation = 0
  let currentCenterX = width / 2
  let currentCenterY = height * 0.44
  let mouseX = width / 2
  let mouseY = height / 2
  let targetMouseX = width / 2
  let targetMouseY = height / 2
  let hoveredStar = null
  let draggedNode = null

  const ANCHOR_SPRING_K = 0.024
  const EDGE_SPRING_K = 0.038
  const DAMPING = 0.885

  function screenToLocal(sx, sy) {
    const dx = sx - currentCenterX
    const dy = sy - currentCenterY
    const cosR = Math.cos(-globalRotation)
    const sinR = Math.sin(-globalRotation)
    return {
      x: dx * cosR - dy * sinR,
      y: dx * sinR + dy * cosR,
    }
  }

  function getCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
      inBounds:
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom,
    }
  }

  function findStarAt(cx, cy, captureRadius = 32) {
    for (const node of constellationNodes) {
      const dx = cx - node.screenX
      const dy = cy - node.screenY
      if (Math.hypot(dx, dy) < captureRadius) {
        return node
      }
    }
    return null
  }

  function onMouseDown(e) {
    if (e.target.closest('button') || e.target.closest('a') || window.scrollY > 200) return
    const pos = getCanvasPos(e.clientX, e.clientY)
    if (!pos.inBounds) return
    const star = findStarAt(pos.x, pos.y, 34)
    if (star) {
      draggedNode = star
      draggedNode.isDragging = true
      draggedNode.vx = 0
      draggedNode.vy = 0

      const local = screenToLocal(pos.x, pos.y)
      draggedNode.x = local.x
      draggedNode.y = local.y

      document.body.style.cursor = 'grabbing'
      canvas.style.cursor = 'grabbing'
    }
  }

  function onMouseMove(e) {
    const pos = getCanvasPos(e.clientX, e.clientY)
    if (!pos.inBounds && !draggedNode) {
      starTooltip.value.visible = false
      hoveredStar = null
      return
    }

    targetMouseX = pos.x
    targetMouseY = pos.y

    if (draggedNode && draggedNode.isDragging) {
      const local = screenToLocal(pos.x, pos.y)
      draggedNode.x = local.x
      draggedNode.y = local.y
      draggedNode.vx = 0
      draggedNode.vy = 0

      starTooltip.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY - 20,
        nombre: draggedNode.name,
        mag: `Mag: ${draggedNode.mag} [Arrastrando]`,
      }
      document.body.style.cursor = 'grabbing'
      canvas.style.cursor = 'grabbing'
      return
    }

    const found = findStarAt(pos.x, pos.y, 28)
    if (found) {
      hoveredStar = found
      starTooltip.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY - 16,
        nombre: found.name,
        mag: `Mag: ${found.mag}`,
      }
      document.body.style.cursor = 'grab'
      canvas.style.cursor = 'grab'
    } else {
      hoveredStar = null
      starTooltip.value.visible = false
      document.body.style.cursor = 'default'
      canvas.style.cursor = 'crosshair'
    }
  }

  function onMouseUp() {
    if (draggedNode) {
      draggedNode.isDragging = false
      draggedNode = null
      document.body.style.cursor = hoveredStar ? 'grab' : 'default'
      canvas.style.cursor = hoveredStar ? 'grab' : 'crosshair'
    }
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    if (e.target.closest('button') || e.target.closest('a')) return
    const pos = getCanvasPos(t.clientX, t.clientY)
    if (!pos.inBounds) return
    const star = findStarAt(pos.x, pos.y, 38)
    if (star) {
      draggedNode = star
      draggedNode.isDragging = true
      draggedNode.vx = 0
      draggedNode.vy = 0
      const local = screenToLocal(pos.x, pos.y)
      draggedNode.x = local.x
      draggedNode.y = local.y
      starTooltip.value = {
        visible: true,
        x: t.clientX,
        y: t.clientY - 28,
        nombre: star.name,
        mag: `Mag: ${star.mag}`,
      }
      if (e.cancelable) e.preventDefault()
    }
  }

  function onTouchMove(e) {
    if (!draggedNode || !draggedNode.isDragging || e.touches.length !== 1) return
    const t = e.touches[0]
    const pos = getCanvasPos(t.clientX, t.clientY)
    const local = screenToLocal(pos.x, pos.y)
    draggedNode.x = local.x
    draggedNode.y = local.y
    starTooltip.value = {
      visible: true,
      x: t.clientX,
      y: t.clientY - 28,
      nombre: draggedNode.name,
      mag: `Mag: ${draggedNode.mag}`,
    }
    if (e.cancelable) e.preventDefault()
  }

  function onTouchEnd() {
    if (draggedNode) {
      draggedNode.isDragging = false
      draggedNode = null
      starTooltip.value.visible = false
    }
  }

  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseleave', onMouseUp)

  canvas.addEventListener('touchstart', onTouchStart, { passive: false })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('touchcancel', onTouchEnd)

  function animate() {
    mouseX += (targetMouseX - mouseX) * 0.06
    mouseY += (targetMouseY - mouseY) * 0.06

    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height),
    )
    gradient.addColorStop(0, '#090d20')
    gradient.addColorStop(0.65, '#04060e')
    gradient.addColorStop(1, '#000000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    const dx = (mouseX - width / 2) * 0.035
    const dy = (mouseY - height / 2) * 0.035

    currentCenterX = width / 2 - dx
    currentCenterY = height * 0.44 - dy

    // Background stars
    ctx.save()
    ctx.translate(-dx * 0.4, -dy * 0.4)
    bgStars.forEach((star) => {
      star.y -= star.moveSpeed
      if (star.y < 0) {
        star.y = height
        star.x = Math.random() * width
      }
      const opacity = ((Math.sin(star.twinkleAngle) + 1) / 2) * 0.85 + 0.15
      star.twinkleAngle += star.twinkleSpeed
      ctx.beginPath()
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()

    globalRotation += 0.00015
    const cosR = Math.cos(globalRotation)
    const sinR = Math.sin(globalRotation)

    constellationNodes.forEach((n) => {
      n.angle += n.wanderSpeed
      n.anchorX = n.ox + Math.cos(n.angle) * n.wanderRadius
      n.anchorY = n.oy + Math.sin(n.angle) * n.wanderRadius
    })

    const fx = new Float32Array(constellationNodes.length)
    const fy = new Float32Array(constellationNodes.length)

    edges.forEach(([i, j], edgeIdx) => {
      const nodeA = constellationNodes[i]
      const nodeB = constellationNodes[j]
      const restLen = restDistances[edgeIdx]

      const edx = nodeB.x - nodeA.x
      const edy = nodeB.y - nodeA.y
      const curLen = Math.sqrt(edx * edx + edy * edy) || 0.001
      const diff = curLen - restLen
      const springF = diff * EDGE_SPRING_K

      const nx = edx / curLen
      const ny = edy / curLen

      fx[i] += nx * springF
      fy[i] += ny * springF
      fx[j] -= nx * springF
      fy[j] -= ny * springF
    })

    if (draggedNode && draggedNode.isDragging) {
      const dragIdx = constellationNodes.indexOf(draggedNode)
      const dragDispX = draggedNode.x - draggedNode.anchorX
      const dragDispY = draggedNode.y - draggedNode.anchorY

      for (let i = 0; i < constellationNodes.length; i++) {
        if (i === dragIdx) continue
        const hops = distMatrix[dragIdx][i]
        const pullFactor = Math.pow(0.52, hops)
        fx[i] += dragDispX * pullFactor * 0.045
        fy[i] += dragDispY * pullFactor * 0.045
      }
    }

    constellationNodes.forEach((n, i) => {
      if (n.isDragging) {
        n.vx = 0
        n.vy = 0
      } else {
        const toAnchorX = (n.anchorX - n.x) * ANCHOR_SPRING_K
        const toAnchorY = (n.anchorY - n.y) * ANCHOR_SPRING_K
        const totalFx = toAnchorX + fx[i]
        const totalFy = toAnchorY + fy[i]

        n.vx = (n.vx + totalFx) * DAMPING
        n.vy = (n.vy + totalFy) * DAMPING

        n.x += n.vx
        n.y += n.vy
      }

      const rotX = n.x * cosR - n.y * sinR
      const rotY = n.x * sinR + n.y * cosR
      n.screenX = currentCenterX + rotX
      n.screenY = currentCenterY + rotY
    })

    ctx.save()
    ctx.translate(currentCenterX, currentCenterY)
    ctx.rotate(globalRotation)

    // Constellation lines
    edges.forEach(([i, j], edgeIdx) => {
      const nodeA = constellationNodes[i]
      const nodeB = constellationNodes[j]
      if (!nodeA || !nodeB) return

      const isDragged = nodeA.isDragging || nodeB.isDragging
      const isAnyDragging = Boolean(draggedNode)
      const isHighlighted = hoveredStar && (hoveredStar.id === nodeA.id || hoveredStar.id === nodeB.id)

      const edx = nodeB.x - nodeA.x
      const edy = nodeB.y - nodeA.y
      const curLen = Math.sqrt(edx * edx + edy * edy)
      const stretchRatio = Math.abs(curLen - restDistances[edgeIdx]) / restDistances[edgeIdx]

      ctx.beginPath()
      ctx.moveTo(nodeA.x, nodeA.y)
      ctx.lineTo(nodeB.x, nodeB.y)

      if (isDragged) {
        ctx.strokeStyle = 'rgba(253, 195, 68, 0.98)'
        ctx.lineWidth = 2.6
        ctx.shadowColor = '#fdc344'
        ctx.shadowBlur = 16
      } else if (isAnyDragging && stretchRatio > 0.08) {
        ctx.strokeStyle = `rgba(253, 195, 68, ${Math.min(0.9, 0.4 + stretchRatio * 1.5)})`
        ctx.lineWidth = 1.8
        ctx.shadowColor = '#fdc344'
        ctx.shadowBlur = 10
      } else if (isHighlighted) {
        ctx.strokeStyle = 'rgba(253, 195, 68, 0.85)'
        ctx.lineWidth = 1.8
        ctx.shadowColor = '#fdc344'
        ctx.shadowBlur = 12
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.lineWidth = 1.0
        ctx.shadowBlur = 0
      }
      ctx.stroke()
      ctx.shadowBlur = 0
    })

    // Stars / nodes
    constellationNodes.forEach((n) => {
      const isHovered = hoveredStar && hoveredStar.id === n.id
      const isDragged = n.isDragging
      const isNeighborMoved = Boolean(draggedNode) && !isDragged && (Math.hypot(n.vx, n.vy) > 0.15 || Math.hypot(n.x - n.anchorX, n.y - n.anchorY) > 8)

      const glowRadius = isDragged ? 42 : isHovered ? 28 : isNeighborMoved ? 24 : n.size * 3.8

      const radgrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRadius)
      radgrad.addColorStop(0, n.color || '#ffffff')
      radgrad.addColorStop(0.35, isDragged ? 'rgba(253, 195, 68, 0.8)' : isHovered ? 'rgba(253, 195, 68, 0.5)' : isNeighborMoved ? 'rgba(253, 195, 68, 0.35)' : 'rgba(255, 255, 255, 0.18)')
      radgrad.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = radgrad
      ctx.beginPath()
      ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2)
      ctx.fill()

      if (isDragged) {
        ctx.strokeStyle = 'rgba(253, 195, 68, 0.65)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowRadius * 0.65, 0, Math.PI * 2)
        ctx.stroke()
      } else if (isNeighborMoved) {
        ctx.strokeStyle = 'rgba(253, 195, 68, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowRadius * 0.55, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      const coreSize = isDragged ? n.size * 1.6 : isHovered ? n.size * 1.4 : isNeighborMoved ? n.size * 1.15 : n.size
      ctx.arc(n.x, n.y, coreSize, 0, Math.PI * 2)
      ctx.fill()

      if (isDragged || isHovered || isNeighborMoved || n.id === 'betelgeuse') {
        ctx.fillStyle = n.color || '#fdc344'
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    ctx.restore()
    animationFrameId = requestAnimationFrame(animate)
  }

  animate()

  cleanupListeners = () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('mouseleave', onMouseUp)
    canvas.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
  }
})

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  cleanupListeners?.()
  document.body.style.cursor = 'default'
})
</script>

<template>
  <!-- Interactive Constellation Canvas Hero Viewport -->
  <section id="heroSection" class="hero-section">
    <!-- Canvas Layer -->
    <canvas ref="canvasRef" class="hero-canvas"></canvas>

    <!-- Star Tooltip -->
    <div
      v-if="starTooltip.visible"
      class="star-tooltip"
      :style="{ left: `${starTooltip.x}px`, top: `${starTooltip.y}px` }"
    >
      <span>{{ starTooltip.nombre }}</span>
      <span class="text-white/60 ml-1.5 font-mono text-[9px]">{{ starTooltip.mag }}</span>
    </div>

    <!-- Bottom Overlay: Experience Cards (Dual Glassmorphism) -->
    <div class="hero-bottom">
      <div class="hero-cards-container">
        <!-- Tarjeta 1: Web Educativa (Pantalla 2D) -->
        <RouterLink class="hero-glass-card web-card" to="/explorar">
          <div class="card-icon-box" aria-hidden="true">
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-badge badge-web">PANTALLA 2D</span>
            <span class="card-title">Explorar Constelaciones</span>
            <span class="card-hint">Relatos y biblioteca &rarr;</span>
          </div>
        </RouterLink>

        <!-- Tarjeta 2: Inmersión 3D / VR -->
        <button
          id="btnVRExperiencia"
          class="hero-glass-card vr-card"
          type="button"
          @click="mostrarModalVR = true"
        >
          <div class="card-icon-box" aria-hidden="true">
            <svg class="card-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4.5l2.5-3 2.5 3H21c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-14 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-badge badge-vr">INMERSIÓN 3D</span>
            <span class="card-title">Entrar al Visor 360°</span>
            <span class="card-hint">Con o sin gafas VR &#10022;</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <a class="hero-scroll-link" href="#observatorio">
      <span>DESPLAZA HACIA ABAJO</span>
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </a>
  </section>

  <!-- Modal de Experiencia VR con 3 Opciones -->
  <div
    v-if="mostrarModalVR"
    class="vr-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-vr-title"
    @click.self="mostrarModalVR = false"
  >
    <div class="vr-modal-container">
      <div class="vr-modal-header">
        <div>
          <h2 id="modal-vr-title" class="vr-modal-title">¿Cómo deseas explorar el cielo?</h2>
          <p class="vr-modal-subtitle">Elige la modalidad que mejor se adapte a tu dispositivo</p>
        </div>
        <button
          class="vr-modal-close"
          type="button"
          aria-label="Cerrar ventana"
          @click="mostrarModalVR = false"
        >
          &times;
        </button>
      </div>

      <div class="vr-modal-grid">
        <!-- Opción 1: Visor Físico -->
        <a
          class="vr-modal-card card-vr-homido"
          href="/prueba-homido/index.html?modo=homido"
        >
          <div class="modal-card-top">
            <div class="modal-card-head">
              <span class="vr-modal-card-badge badge-homido">Gafas o Visor</span>
              <div class="modal-card-icon-box icon-homido" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4.5l2.5-3 2.5 3H21c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-14 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </div>
            </div>
            <h3 class="modal-card-title">Visor Celular (Homido)</h3>
            <p class="modal-card-desc">
              Inmersión estéreo en 3D colocando tu celular dentro de gafas Homido o Cardboard.
            </p>
            <ul class="modal-card-tags">
              <li><span>✦</span> Doble pantalla 3D</li>
              <li><span>✦</span> Manos libres por mirada</li>
            </ul>
          </div>
          <span class="vr-modal-card-action action-homido">Iniciar con Visor &rarr;</span>
        </a>

        <!-- Opción 2: 3D Versión Lite -->
        <a
          class="vr-modal-card card-vr-lite"
          href="/prueba-homido/index.html?modo=libre"
        >
          <div class="modal-card-top">
            <div class="modal-card-head">
              <span class="vr-modal-card-badge badge-lite">Sin Accesorios</span>
              <div class="modal-card-icon-box icon-lite" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.6 9h16.8M3.6 15h16.8"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18"/>
                </svg>
              </div>
            </div>
            <h3 class="modal-card-title">3D Versión Lite</h3>
            <p class="modal-card-desc">
              Exploración 360° fluida directamente en tu pantalla, sin necesidad de accesorios.
            </p>
            <ul class="modal-card-tags">
              <li><span>✦</span> Gira con dedo o mouse</li>
              <li><span>✦</span> Carga ágil para todo equipo</li>
            </ul>
          </div>
          <span class="vr-modal-card-action action-lite">Iniciar Versión Lite &rarr;</span>
        </a>

        <!-- Opción 3: 3D Versión Completa (Full) -->
        <RouterLink
          class="vr-modal-card card-vr-full"
          to="/visor-3d"
        >
          <div class="modal-card-top">
            <div class="modal-card-head">
              <span class="vr-modal-card-badge badge-full">Inmersión Total ★</span>
              <div class="modal-card-icon-box icon-full" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <h3 class="modal-card-title">3D Versión Completa</h3>
            <p class="modal-card-desc">
              Experiencia estelar máxima con estantería interactiva de libros y voz guiada.
            </p>
            <ul class="modal-card-tags">
              <li><span>✦</span> Bóveda + Estantería 3D</li>
              <li><span>✦</span> Narración espacial guiada</li>
            </ul>
          </div>
          <span class="vr-modal-card-action action-full">Iniciar Versión Full &rarr;</span>
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       INFORMACIÓN ABAJO: MANUALES PEDAGÓGICOS Y CRÉDITOS ACADÉMICOS
       ========================================================================= -->
  <main id="observatorio" class="container py-8">
    <!-- Requisitos de accesibilidad y pruebas: preservados discretamente -->
    <div class="sr-only" aria-hidden="true">
      <header class="home-intro" aria-labelledby="home-title">
        <div class="home-heading-row">
          <h1 id="home-title" tabindex="-1">Explora AstroVisor</h1>
          <span class="home-tagline">Cada estrella, una historia</span>
        </div>
        <p class="home-lead">
          Descubre constelaciones e historias del cielo. Elige cómo deseas comenzar.
        </p>
      </header>

      <section class="portal-section" aria-labelledby="home-title">
        <div class="portal-cards">
          <article id="tarjeta-explorar" class="portal-card" aria-labelledby="card-web-title">
            <div class="portal-card-badge">Computadora o Proyector</div>
            <h2 id="card-web-title" class="portal-card-title">Experiencia Web Educativa</h2>
            <p class="portal-card-desc">
              Recorrido en pantalla con constelaciones, narraciones en audio, historias culturales y libros recomendados de la biblioteca.
            </p>
            <div class="portal-card-actions">
              <RouterLink class="portal-button primary" to="/explorar">
                Explorar en pantalla
              </RouterLink>
            </div>
          </article>

          <article id="tarjeta-vr" class="portal-card portal-card-vr" aria-labelledby="card-vr-title">
            <div class="portal-card-badge accent">Entorno 3D e Inmersión</div>
            <h2 id="card-vr-title" class="portal-card-title">Experiencia Inmersiva 3D</h2>
            <p class="portal-card-desc">
              Exploración del cielo nocturno en 360 grados. Elige la modalidad de visualización según tu dispositivo:
            </p>
            <div class="portal-card-actions vr-actions">
              <RouterLink class="portal-button primary" to="/visor-3d">
                <span class="btn-main">Experiencia 3D Mejorada (Three.js)</span>
              </RouterLink>
              <a class="portal-button secondary" href="/prueba-homido/index.html?modo=libre">
                <span class="btn-main">3D ligera · mouse o dedo</span>
              </a>
              <a class="portal-button homido" href="/prueba-homido/index.html?modo=homido">
                <span class="btn-main">Visor Homido · pantalla dividida</span>
              </a>
            </div>
          </article>

          <article id="tarjeta-admin" class="portal-card" aria-labelledby="card-admin-title">
            <div class="portal-card-badge muted">Gestión y Catálogo</div>
            <h2 id="card-admin-title" class="portal-card-title">Administración</h2>
            <p class="portal-card-desc">
              Panel para personal bibliotecario y docente.
            </p>
            <div class="portal-card-actions">
              <RouterLink class="portal-button outline" to="/admin">
                Abrir administración
              </RouterLink>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Sección de Manuales en Video (S5-05) -->
    <section class="portal-manuals" aria-labelledby="manuals-heading">
      <div class="portal-header">
        <h2 id="manuals-heading">Manuales de uso y exploración</h2>
        <p>Guías pedagógicas diseñadas para facilitar el uso autónomo de cada área de la aplicación.</p>
      </div>

      <div class="manuals-grid">
        <!-- Manual 1: Web -->
        <article class="manual-item" aria-labelledby="manual-web-title">
          <div class="manual-badge-status" role="status">
            <span class="badge-dot"></span>
            Guion preparado · Pendiente de grabación
          </div>
          <h3 id="manual-web-title">1. Cómo usar la web educativa</h3>
          <p class="manual-desc">
            Recorrido paso a paso por la computadora y la proyección en pantalla grande: cómo navegar entre constelaciones, escuchar narraciones y consultar libros recomendados.
          </p>
          <details class="manual-details">
            <summary>Ver guion técnico y transcripción accesible</summary>
            <div class="manual-transcript">
              <ol>
                <li><strong>Inicio:</strong> Abre AstroVisor y pulsa «Explorar en pantalla» para acceder al catálogo público.</li>
                <li><strong>Constelaciones:</strong> Selecciona Orión, Osa Mayor o Escorpio para ver su figura ilustrada y su relato mitológico.</li>
                <li><strong>Audio:</strong> Pulsa «Escuchar narración» para oír la voz de Kokoro. Puedes pausar o consultar la transcripción textual completa.</li>
                <li><strong>Vista para proyección:</strong> Pulsa el botón superior para agrandar los textos a 24 px si estás usando un proyector o pantalla de televisión.</li>
                <li><strong>Libros:</strong> Consulta las recomendaciones al pie de cada ficha para acercarte a la biblioteca y solicitar lecturas afines.</li>
              </ol>
            </div>
          </details>
        </article>

        <!-- Manual 2: VR -->
        <article class="manual-item" aria-labelledby="manual-vr-title">
          <div class="manual-badge-status" role="status">
            <span class="badge-dot"></span>
            Guion preparado · Pendiente de grabación
          </div>
          <h3 id="manual-vr-title">2. Cómo explorar en VR (Libre y Homido)</h3>
          <p class="manual-desc">
            Instrucciones para navegar en 3D: interacción con mouse o dedo en modo libre, colocación en el visor Homido, selección por mirada durante 3 segundos y botones de bienestar.
          </p>
          <details class="manual-details">
            <summary>Ver guion técnico y transcripción accesible</summary>
            <div class="manual-transcript">
              <ol>
                <li><strong>Modo Libre (mouse/dedo):</strong> Selecciona «Pantalla completa · mouse o dedo». Arrastra con el cursor o desliza la pantalla táctil para recorrer las estrellas.</li>
                <li><strong>Modo Homido (pantalla dividida):</strong> Selecciona «Visor Homido». El sistema activa automáticamente la doble cámara para cada ojo. Coloca el teléfono dentro del visor.</li>
                <li><strong>Selección por mirada:</strong> Centra el aro blanco en Orión, Osa Mayor o Escorpio durante 3 segundos. El aro amarillo indicará el progreso hasta abrir la ficha.</li>
                <li><strong>Cielo visible y audio:</strong> La constelación seguirá iluminada de fondo mientras escuchas el relato. Pulsa «Pausar» o «Repetir» en cualquier momento.</li>
                <li><strong>Pausa de mirada y salida:</strong> Usa el botón «Pausar mirada» si deseas contemplar las estrellas sin activar fichas. El botón «Salir» detiene el audio y vuelve a la web con seguridad.</li>
              </ol>
            </div>
          </details>
        </article>

        <!-- Manual 3: Administración -->
        <article class="manual-item" aria-labelledby="manual-admin-title">
          <div class="manual-badge-status" role="status">
            <span class="badge-dot"></span>
            Guion preparado · Pendiente de grabación
          </div>
          <h3 id="manual-admin-title">3. Cómo administrar el catálogo</h3>
          <p class="manual-desc">
            Procedimiento para el personal de la biblioteca: acceso seguro, consulta del inventario persistente, alta de libros con año opcional y asignación de portadas ilustrativas.
          </p>
          <details class="manual-details">
            <summary>Ver guion técnico y transcripción accesible</summary>
            <div class="manual-transcript">
              <ol>
                <li><strong>Acceso:</strong> Pulsa «Abrir administración» e introduce las credenciales autorizadas en el formulario protegido.</li>
                <li><strong>Consulta:</strong> Visualiza la lista de libros y constelaciones asociadas en el repositorio documental persistente.</li>
                <li><strong>Alta de libro:</strong> Completa título, autor, constelación relacionada, motivo y enlace público HTTPS. El campo año es opcional.</li>
                <li><strong>Portadas:</strong> El sistema genera automáticamente una portada armónica en formato SVG o permite asociar una imagen autorizada.</li>
                <li><strong>Publicación:</strong> Guarda los cambios con control de concurrencia para que se sincronicen de inmediato con el catálogo público.</li>
              </ol>
            </div>
          </details>
        </article>
      </div>
    </section>

    <!-- Sección de Créditos e Identidad Institucional (S5-06) -->
    <section class="portal-credits" aria-labelledby="credits-heading">
      <div class="credits-box">
        <h2 id="credits-heading" class="credits-title">AstroVisor — Proyecto Académico</h2>
        <p class="credits-team">
          Desarrollado por el <strong>Equipo 8</strong> de la materia <strong>Taller de Full Stack</strong>:
        </p>
        <ul class="team-list">
          <li>Karime Rendón Vázquez</li>
          <li>Luis Alberto Rodríguez</li>
          <li>Carlos Martínez Orozco</li>
          <li>Índigo Andre Ortiz Vega</li>
        </ul>
        <div class="credits-affiliations">
          <p>
            En vinculación con la <strong>Biblioteca Pública Central Estatal Solón Argüello</strong> y el <strong>Instituto Tecnológico de Tepic (TecNM)</strong>.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
