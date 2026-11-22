# Design: Tarjetas Glassmorphism en Portada Principal

## Arquitectura de Componentes

### 1. Limpieza de `hero-topbar` en `InicioView.vue`
- Se remueve el elemento `<header class="hero-topbar">` que encerraba `.hero-brand-panel`.
- La cabecera superior global en `App.vue` (`<header class="site-header">`) permanece como la única identidad visual visible en la página con el isotipo de estrella dorada y nombre institucional.

### 2. Estructura de las Tarjetas de Entrada
Dentro de `<div class="hero-bottom">`:
```html
<div class="hero-cards-container">
  <!-- Tarjeta 1: Explorar en Pantalla -->
  <RouterLink class="hero-glass-card web-card" to="/explorar">
    <div class="card-icon-box">
      <!-- SVG libro / estrellas -->
    </div>
    <div class="card-content">
      <span class="card-badge">PANTALLA 2D</span>
      <h2 class="card-title">Explorar Constelaciones</h2>
      <span class="card-hint">Relatos y biblioteca &rarr;</span>
    </div>
  </RouterLink>

  <!-- Tarjeta 2: Entrar al Visor 3D / VR -->
  <button id="btnVRExperiencia" class="hero-glass-card vr-card" type="button" @click="mostrarModalVR = true">
    <div class="card-icon-box">
      <!-- SVG gafas VR -->
    </div>
    <div class="card-content">
      <span class="card-badge gold">INMERSIÓN 3D</span>
      <h2 class="card-title">Entrar al Visor 360°</h2>
      <span class="card-hint">Con o sin gafas VR &compfn;</span>
    </div>
  </button>
</div>
```

### 3. Estilos CSS (Glassmorphism & Glow) en `public.css`
- **Contenedor `.hero-cards-container`:**
  - `display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 720px; margin: 0 auto;`
  - En pantallas medianas (`@media (min-width: 640px)`): `flex-direction: row; justify-content: center;`
- **Tarjetas `.hero-glass-card`:**
  - `background: rgba(11, 21, 48, 0.65);`
  - `backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);`
  - `border: 1px solid rgba(255, 255, 255, 0.16);`
  - `border-radius: 14px;`
  - `padding: 1.1rem 1.4rem;`
  - `transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);`
  - `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.36);`
- **Hover Effects:**
  - `transform: translateY(-4px);`
  - Web card: `border-color: rgba(56, 189, 248, 0.6); box-shadow: 0 12px 36px rgba(14, 165, 233, 0.35);`
  - VR card: `border-color: rgba(245, 179, 1, 0.7); box-shadow: 0 12px 36px rgba(245, 179, 1, 0.38);`
- **Tipografía y Legibilidad:**
  - Títulos en fuentes legibles con buen contraste sobre fondo nocturno (`#ffffff`).
  - Badges con letra pequeña, espaciado generoso y colores distintivos (azul celeste y oro solar).
