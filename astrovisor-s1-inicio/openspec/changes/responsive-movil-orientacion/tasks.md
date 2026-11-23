# Tasks: Optimización Responsiva Móvil e Indicador de Giro 3D

## 1. Navegabilidad y Accesibilidad del Modal VR en Móvil

- [x] 1.1 Habilitar scroll táctil en `vr-modal-backdrop` y `margin: auto` en `vr-modal-container`.
- [x] 1.2 Configurar cabecera `sticky` con botón de cierre de 44×44px accesible.
- [x] 1.3 Incorporar botón de retorno `← Volver a la portada` en pie del modal y atajo de tecla `Escape`.

## 2. Corrección de Tarjetas VR en Móvil y Landscape

- [x] 2.1 Aplicar `grid-auto-rows: max-content` y `align-content: start` en rejilla móvil evitando cortes de texto y viñetas.
- [x] 2.2 Mantener vista compacta de 3 columnas en landscape móvil sin solapamientos.

## 3. Indicador de Giro de Pantalla en Experiencias 3D/VR

- [x] 3.1 Diseñar componente flotante cósmico con animación SVG de rotación de teléfono.
- [x] 3.2 Integrar indicador en visor Homido (`/prueba-homido/index.html?modo=homido`).
- [x] 3.3 Integrar indicador en visor 3D Lite (`/prueba-homido/index.html?modo=libre`).
- [x] 3.4 Integrar indicador en Visor 3D Completo (`/visor-3d`).
- [x] 3.5 Implementar descarte manual con persistencia en sesión y desaparición automática en landscape.

## 4. Normalización de Logotipos Institucionales

- [x] 4.1 Agrandar y equilibrar logotipos institucionales en pantallas de computadora (`> 768px`).
- [x] 4.2 Mantener cuadrícula 2×2 ordenada en móvil (`<= 640px`).
- [x] 4.3 Retirar nota provisional de autorización institucional a solicitud de usuario.

## 5. Pruebas y Validación

- [x] 5.1 Ejecutar suite de pruebas de portal (`node --test test/inicio-portal-s5.test.js`).
- [x] 5.2 Compilar versión de producción con Vite (`npm run build`).
- [x] 5.3 Validar formalmente la especificación con OpenSpec (`npx openspec validate responsive-movil-orientacion --strict`).
