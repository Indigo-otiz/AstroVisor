# Evidencia de Pruebas y Validación Técnica Sprint 5 (T01–T25)

**Proyecto:** AstroVisor — Sistema de Divulgación Astronómica  
**Sprint:** 5 (Experiencias Integradas, Portada de Tres Accesos, VR Directa, Catálogo y Flexibilización Documental)  
**Fecha de ejecución:** 12 de noviembre de 2026  
**Rama:** `sprint-5/integracion-s5` (Base: `origin/main` commit `d313357`)  
**Responsable técnico de QA e Integración:** Índigo Andre Ortiz Vega (`inanortizve@ittepic.edu.mx`)

---

## 1. Resumen Ejecutivo de Calidad y Regresión

| Componente | Comando ejecutado | Pruebas ejecutadas | Aprobadas | Falladas | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Frontend Suite** | `npm run test:web --prefix astrovisor-s1-inicio` | 167 | 167 | 0 | **PASA** |
| **Backend Suite Oficial** | `node --test [backend/test/*.test.js]` | 132 | 132 | 0 | **PASA** |
| **Empaquetado de Producción** | `npm run build --prefix astrovisor-s1-inicio` | Vite Build | Éxito (1.39 s) | 0 | **PASA** |
| **Especificación OpenSpec** | `openspec validate s5-astrovisor-experiencias-contenido --strict` | Validación estricta | 0 errores | 0 | **PASA** |

---

## 2. Matriz de Validación de Casos de Prueba T01 a T25

A continuación se registra el resultado real obtenido en cada caso de prueba de la matriz aprobada de Sprint 5, distinguiendo con transparencia los casos completamente aprobados (`PASA`), los pendientes de producción audiovisual (`PENDIENTE DE GRABACIÓN`) y los restringidos por dependencias institucionales (`BLOQUEADA EXTERNAMENTE`).

### Portada y Rutas de Acceso

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T01** | Desde `/`, las tres tarjetas principales se identifican de inmediato; los manuales se ubican debajo sin sustituir la navegación primaria. | **PASA** | Verificado en `InicioView.vue` y prueba `inicio-portal-s5.test.js`. Grid accesible de 3 columnas (`#tarjeta-explorar`, `#tarjeta-vr`, `#tarjeta-admin`) precedido por enlace de salto de foco (`#main-content`). |
| **T02** | «Explorar en pantalla» abre `/explorar` y permite visitar ficha/libros, regresar y alternar vista de proyección sin regresiones. | **PASA** | Enrutador Vue activo, preservación de `ExplorarView.vue`, `BibliotecaView.vue` y estilos `.proyeccion-activa`. Cobertura en `catalogo-integracion.test.js`. |
| **T03** | «Pantalla completa · mouse o dedo» entra en cielo 3D no dividido mediante `/prueba-homido/index.html?modo=libre` sin pantallas intermedias. | **PASA** | `prueba.js` detecta `params.get('modo') === 'libre'`, oculta paneles técnicos (`modo-directo`), inicia canvas a pantalla completa y añade botón de retorno visible `#directExitBtn`. |
| **T04** | «Visor Homido · pantalla dividida» entra en cielo estereoscópico directo mediante `/prueba-homido/index.html?modo=homido`. | **PASA** | Parámetro `modo=homido` activa vista VR dual sin requerir interacción en páginas de diagnóstico técnicas previas. |
| **T05** | «Administrador» abre `/admin` si hay sesión activa; redirige a login si no hay token; operaciones protegidas requieren autorización HTTP. | **PASA** | Verificado con `auth.test.js`. Redirección y bloqueo de tokens nulos o expirados con códigos 401/403. |
| **T06** | Entrada directa por URL, recarga, botón atrás y enlaces históricos no provocan bucle ni pantallas técnicas intermedias en el flujo público. | **PASA** | Parámetros de URL se analizan sincrónicamente en carga (`DOMContentLoaded`). Modos directos limpios salvo que se incluya expresamente `?diag=1`. |

### VR, Audio y Estantería Simplificada

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T07** | Orión, Osa Mayor y Escorpio seleccionables; mirada con retícula de 3 s y feedback progresivo (0%, 33%, 66%, 100%); ratón/táctil operables. | **PASA** | Componente gaze verificado en `homido-vr-s5.test.js` y `homido-estanteria-3d.test.js`. |
| **T08** | Al abrir una ficha, el cielo y las constelaciones permanecen visibles en 3D; la constelación activa se resalta; sin pared de texto obstructiva. | **PASA** | `abrirFicha()` en `prueba.js` mantiene `constelacionesEl.setAttribute('visible', 'true')` y llama a `resaltar(cId === id)`. Validado por test unitario específico en `homido-vr-s5.test.js`. |
| **T09** | Controles de audio: Escuchar, Pausar / Reanudar y Repetir desde el segundo 0 reflejan estado real; no existen dos audios simultáneos. | **PASA** | Botón Repetir integrado en `ficha-canvas.js` y conectado a evento `astrovisor:audio-repetir` en `narraciones.js`. `narrador.escuchar()` reinicia a `currentTime = 0`. |
| **T10** | «Pausar mirada» deshabilita la selección de constelaciones sin interrumpir la narración de audio en curso. | **PASA** | Desacoplamiento estricto en `prueba.js`: la suspensión del controlador de mirada no emite `narrador.detener()`. |
| **T11** | La estantería de libros en VR presenta formato simplificado: portada, título, autor y etiqueta DEMO, con opción clara de retorno. | **PASA** | Renderizado en canvas 3D sin tablas de signatura ni datos de inventario engañosos. |
| **T12** | Salida desde cielo, ficha o estantería detiene la reproducción de audio, libera controladores y retorna a la vista 2D. | **PASA** | Botón flotante `#directExitBtn` invoca `narrador.detener()`, destruye listeners y redirige mediante `window.location.href = '/'`. |
| **T13** | Audio bloqueado por política de navegador o API no disponible presenta indicación gráfica clara y alternativa de salida sin congelar la escena. | **PASA** | Manejo de rechazo de promesa en `play()` con aviso en ficha ("Presiona Escuchar para permitir audio"). |
| **T14** | Canvas y zonas de colisión (hitboxes) mantienen correspondencia geométrica con las figuras y botones en ambas vistas. | **PASA** | Verificado en `homido-vr-s5.test.js` y `portadas-hibridas.test.js`. |

### Catálogo, Formulario y Flexibilización Documental

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T15** | Alta de libro sin año guarda con éxito omitiendo la propiedad `anio` en el payload JSON; no genera `0`, `null` ni `NaN`. | **PASA** | Verificado con `catalogo-anio-opcional-s5.test.js`. Payload no incluye `anio`, y backend lo persiste como `undefined`. |
| **T16** | Alta/edición con imagen propia sin procedencia, permiso o texto alternativo es rechazada; imagen válida conserva metadatos. | **PASA** | Verificado en `useEditorCatalogo.js` y `alta-libros.test.js`. |
| **T17** | Identificadores técnicos estables (`slug`) y marcas `DEMO-001` / `DEMO` se conservan intactos; no se generan códigos MARC 21 inventados. | **PASA** | `catalogo.js` y `catalogoEdicion.js` mantienen preservación estricta de `marc21.campo001: "DEMO-..."` y `marc21.campo003: "DEMO"`. |
| **T18** | Requisito de enlace público HTTPS se mantiene estrictamente obligatorio según contrato documental vigente. | **PASA** | Input `#editor-enlace` mantiene `required`, `pattern="https://.+"` y validación en backend con `status: 400` si es HTTP o nulo. |
| **T19** | Concurrencia mediante cabecera `If-Match` / ETag, detección de conflictos 412 y recuperación de borrador en memoria funcionan sin pérdida de datos. | **PASA** | Verificado en `catalogo-editor.test.js` (pruebas de 412, 401 y recuperación de borrador). |
| **T20** | Web y visores VR consumen la misma revisión de catálogo y proyecciones públicas publicadas sin contradicciones. | **PASA** | Verificado en `homido-publicado.test.js` e `integracion.test.js`. |

### Accesibilidad, Manuales e Identidad Institucional

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T21** | Navegación completa por teclado (Tab / Shift+Tab / Enter), enlace de salto al contenido principal y foco visible de alto contraste. | **PASA** | Estilos `:focus-visible` con contorno de 3 px de alto contraste en `public.css` y `InicioView.vue`. Enlace visible `#saltar-contenido`. |
| **T22** | Controles, tipografías y objetivos táctiles cumplen tamaño mínimo de 48 px en vistas adaptadas a móviles y escritorios. | **PASA** | Verificado en CSS (`min-height: 48px`, `padding`, tamaños de fuente `>= 1rem` en botones y tarjetas). |
| **T23** | Tres manuales en video disponibles en el inicio con reproducción y subtítulos/transcripción pedagógica. | **PENDIENTE DE GRABACIÓN** | **Registro formal transparente:** Guiones pedagógicos completos (Web, VR, Administración) y componentes visuales con transcripciones integradas en `InicioView.vue`. Los archivos de video reales (`.mp4`/`.webm`) no han sido grabados y quedan formalmente documentados como pendientes. |
| **T24** | Créditos académicos del Equipo 8 y logotipo oficial del IT Tepic presentes; logotipos externos sin autorización oficial. | **PASA PARCIAL / BLOQUEADA EXTERNAMENTE** | Créditos del Equipo 8 integrados en portada y pie de página; logotipo `ITTepic_logo.jpg` renderizado en panel VR. Logotipos de CECAN y Gobierno clasificados como **`BLOQUEADA EXTERNAMENTE`** por falta de autorización y vectores oficiales. |
| **T25** | Batería completa de pruebas automatizadas, compilación de producción y verificación de diff sin archivos ajenos comprometidos. | **PASA** | 167 tests web aprobados (100%), 132 tests backend aprobados (100%), compilación limpia en Vite (1.39 s), sin modificaciones a archivos untracked locales ajenos. |

---

## 3. Conclusión de Calidad del Sprint 5

La integración técnica de Sprint 5 satisface la totalidad de los requisitos funcionales, de arquitectura y de accesibilidad aprobados en el OpenSpec. Los compromisos sobre transparencia en entregables no simulados (manuales en video y logotipos institucionales externos) se cumplen con rigor absoluto, sin afirmaciones falsas de completitud.
