# Propuesta S2 — Selección por mirada y retroalimentación accesible (Homido / Visor)

## Why

Karime necesita entregar en el Sprint 2 los controles definitivos de selección por mirada (*gaze dwell*) y retroalimentación accesible para el visor Homido y la experiencia inmersiva de AstroVisor. En el Sprint 1 se generó una prueba técnica preliminar y experimental (`frontend/public/prueba-homido/`), pero carece de los controles modulares y accesibles diseñados en el sistema visual de Figma (documentado en `Spring 1_ Rendon Vazquez.pdf`). 

Los adultos mayores y visitantes de la biblioteca necesitan una mirilla comprensible, con un tiempo de permanencia holgado y sin prisa (3 segundos), un anillo de progreso que muestre claramente el avance (0 %, 33 %, 66 %, 100 %), una confirmación inequívoca al completar la selección y una forma intuitiva de pausar o regresar al modo web 2D tradicional en cualquier momento.

## What Changes

- Convertir la escena experimental de Homido de S1 en una experiencia con controles reutilizables y modulares de:
  - **Retícula de mirada accesible:** Cursor central con halo de contraste legible sobre fondo oscuro (`#0B1530`), con anillo de progreso en color acento amarillo (`#F5B301`).
  - **Permanencia (*Gaze Dwell*) de 3 segundos:** Temporizador visual accesible que se llena progresivamente en 4 estados perceptibles (0 %, 33 %, 66 %, 100 %) al posar la mirada en puntos de interés u objetos celestes.
  - **Retroalimentación de confirmación:** Indicador inmediato de selección exitosa (pulso y retroalimentación visual accesible).
  - **Cancelación suave:** Si el usuario aparta la vista antes de completar los 3 segundos, el anillo se reinicia a 0 % sin disparar acciones imprevistas.
  - **Panel de información estereoscópico:** Al seleccionar una constelación (ej. Orión), se despliega la tarjeta con título, descripción y recomendación de libro en ambos ojos (28 px), con botón de retorno al visor.
  - **Controles de visor:** Botones de `Pausa / Continuar` y `Salir` (72 px de alto con borde blanco), además de acceso inmediato para regresar a la experiencia web 2D (`/explorar`).
- Compatibilidad dual: el sistema debe funcionar tanto en visor Homido (con giroscopio o vista dividida estéreo) como en pantalla 2D con mouse o toque directo.
- Rotulación estricta de contenido ficticio o provisional como `Dato de muestra`.
- Documentación y registro de evidencia en `docs/PRUEBA-S2-HOMIDO.md` con capturas de los estados de la retícula y matriz de pruebas.

Fuera de alcance: integración con hardware físico adicional, modificaciones a la base documental ni alteración del panel administrativo más allá de la navegación hacia el visor.

## Capabilities

### New Capabilities

- `seleccion-mirada`: retícula central, permanencia accesible con anillo de progreso (`#F5B301`) de 0 a 100 % en 3 segundos, confirmación visual, cancelación por desvío, visualización de fichas en estéreo/2D y controles de pausa y salida a 2D.

### Modified Capabilities

- Ninguna especificación principal previa modificada; se construye de forma aditiva integrando los wireframes de Karime sobre la base de AstroVisor.

## Impact

- Proyecto objetivo: `astrovisor-s1-inicio/` (Vue 3, Vite, A-Frame / WebGL).
- Frontend:
  - Componente o módulo reutilizable de retícula y permanencia accesible.
  - Actualización de `VisorView.vue` y de la experiencia de visor en `frontend/public/prueba-homido/` o vista integrada para reflejar el sistema visual de Karime.
  - Botones y paneles informativos del visor con tipografía accesible y contrastes superiores a 4.5:1.
- Documentación: `docs/PRUEBA-S2-HOMIDO.md` con evidencias de los estados (0 %, 33 %, 66 %, 100 %, confirmación y retorno 2D).
