# Tasks: Controles de Administración, Terminología Accesible e Instrucciones Claras

## 1. Barra de Accesos Directos Inteligente en Administración

- [x] 1.1 Diseñar componente de barra de navegación rápida (Subnav) con enlaces ancla a `#seccion-experiencias`, `#catalogo-heading`, `#constelaciones-editor`.
- [x] 1.2 Implementar acción rápida `+ Registrar Libro` que dispara `nuevoLibro()`, realiza scroll suave y enfoca el formulario.
- [x] 1.3 Incorporar botón flotante «Volver arriba» con escucha de scroll en `AdminPanelView.vue`.
- [x] 1.4 Agregar estilos responsivos y adherentes (`sticky`) en `public.css`.

## 2. Reemplazo del Término Aislado "Homido"

- [x] 2.1 Reemplazar enlace `Homido` por `Visor VR` en la barra de navegación de `App.vue`.
- [x] 2.2 Reemplazar títulos de pestaña y referencias de estado en `App.vue` y `useEditorCatalogo.js`.
- [x] 2.3 Ajustar botones y avisos en `Visor3DView.vue`, `ExplorarView.vue` y `AdminPanelView.vue`.

## 3. Síntesis de Instrucciones en VisorView

- [x] 3.1 Actualizar textos de los 3 pasos de preparación del visor en `VisorView.vue` a formato conciso.
- [x] 3.2 Actualizar textos de las 2 cajas de pausa y seguridad en `VisorView.vue`.

## 4. Verificación y Calidad

- [x] 4.1 Ejecutar suite de pruebas unitarias (`node --test test/inicio-portal-s5.test.js`).
- [x] 4.2 Compilar versión de producción con Vite (`npm run build`).
- [x] 4.3 Validar formalmente la especificación con OpenSpec (`npx openspec validate admin-subnav-terminologia-visor --strict`).
- [x] 4.4 Capturar evidencia visual con Chrome de la nueva barra en admin y tarjetas de guía.
