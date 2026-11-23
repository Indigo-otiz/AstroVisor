# Tasks: Tipografía Accesible, Caja Mixta e Identidad Institucional

## 1. Definición de Variables y Tipografía en CSS

- [x] 1.1 Estandarizar variables tipográficas en `public.css` reemplazando `Orbitron` por sans-serif de alta legibilidad (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`) para elementos de interfaz.
- [x] 1.2 Incorporar variables cromáticas de identidad (`--cecan-wine: #7a152b`, `--brand-blue: #1f4e8c`) en `public.css`.
- [x] 1.3 Eliminar reglas de `text-transform: uppercase` en tarjetas glass, badges y modales para adoptar caja mixta natural.

## 2. Erradicación de Textos Amarillos y Mejora de Contraste

- [x] 2.1 Reemplazar textos amarillos en `.hero-glass-card`, `.badge-vr`, `.action-full`, `.hud-badge` y etiquetas por blanco (`#ffffff`) o azul celeste (`#bae6fd`) sobre fondos oscuros.
- [x] 2.2 Reemplazar textos y enlaces amarillos en fondos claros por azul marino (`#1f4e8c`) o carbón profundo (`#1b2430`), reservando tonos dorados exclusivamente a detalles vectoriales de borde o estrellas.

## 3. Ajuste de Componentes y Vistas

- [x] 3.1 Actualizar textos en `InicioView.vue` para caja mixta («Pantalla 2D», «Inmersión 3D», «Gafas o visor», «Desplazar hacia abajo»).
- [x] 3.2 Armonizar badges y encabezados en `VisorView.vue` y `ConstelacionView.vue` para coherencia editorial.

## 4. Verificación y Regresión

- [x] 4.1 Ejecutar batería completa de pruebas frontend (`npm run test:web`) y verificar que los 179 tests pasen exitosamente.
- [x] 4.2 Validar formalmente la especificación con `npx openspec validate tipografia-e-identidad-accesible --strict`.
