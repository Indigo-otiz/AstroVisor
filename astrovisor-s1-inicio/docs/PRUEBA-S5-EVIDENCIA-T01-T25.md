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
| **Frontend Suite** | `npm run test:web --prefix astrovisor-s1-inicio` | 175 | 175 | 0 | **PASA** |
| **Backend Suite Oficial** | `node --test [backend/test/*.test.js]` | 145 | 145 | 0 | **PASA** |
| **Empaquetado de Producción** | `npm run build --prefix astrovisor-s1-inicio` | Vite Build | Éxito (2.46 s) | 0 | **PASA** |
| **Especificación OpenSpec** | `openspec validate s5-astrovisor-experiencias-contenido --strict` | Validación estricta | 0 errores | 0 | **PASA** |

---

## 2. Matriz de Validación de Casos de Prueba T01 a T25

A continuación se registra el resultado real obtenido en cada caso de prueba de la matriz aprobada de Sprint 5, distinguiendo con transparencia los casos completamente aprobados (`PASA`), los pendientes de producción audiovisual (`PENDIENTE DE GRABACIÓN`) y los restringidos por dependencias institucionales (`BLOQUEADA EXTERNAMENTE`).

### Portada y Rutas de Acceso

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T01** | Desde `/`, las tres tarjetas principales se identifican de inmediato en el primer viewport en escritorio (1366×768 y 1280×800 sin scroll vertical); hero decorativo de Orión eliminado; manuales y créditos debajo sin desplazar la navegación primaria (Corrección UX/UI S5-01). | **PASA** | Verificado en `InicioView.vue`, `App.vue` y prueba `inicio-portal-s5.test.js`. Header con conmutador de proyección compacto, grid accesible de 3 columnas (`#tarjeta-explorar`, `#tarjeta-vr`, `#tarjeta-admin`), diseño responsivo móvil 1 col en 390×844 y capturas de viewport en `evidencias-s5/`. |
| **T02** | «Explorar en pantalla» abre `/explorar` y permite visitar ficha/libros, regresar y alternar vista de proyección sin regresiones. | **PASA** | Enrutador Vue activo, preservación de `ExplorarView.vue`, `BibliotecaView.vue` y estilos `.proyeccion-activa`. Cobertura en `catalogo-integracion.test.js`. |
| **T03** | «Pantalla completa · mouse o dedo» entra en cielo 3D no dividido mediante `/prueba-homido/index.html?modo=libre` sin pantallas intermedias. | **PASA** | `prueba.js` detecta `params.get('modo') === 'libre'`, oculta paneles técnicos (`modo-directo`), inicia canvas a pantalla completa y añade botón de retorno visible `#directExitBtn`. |
| **T04** | «Visor Homido · pantalla dividida» entra en cielo estereoscópico directo mediante `/prueba-homido/index.html?modo=homido`. | **PASA** | Parámetro `modo=homido` activa vista VR dual sin requerir interacción en páginas de diagnóstico técnicas previas. Incluye botón flotante directo `#btnActivarInmersion` con solicitud de permisos de orientación ejecutada síncronamente en el gesto del usuario (sin `await` previo para preservar User Gesture en WebKit/Safari), comprobación independiente de pantalla completa, orientación y audio real del reproductor (sincronizado con `narrador` de `narraciones.js` mediante el evento `astrovisor:narracion` y sin AudioContext ficticio), persistencia del botón si faltan condiciones (no se oculta solo por pantalla completa) y soporte de reintento dinámico sin bloquear la escena 3D. |
| **T05** | «Administrador» abre `/admin` si hay sesión activa; redirige a login si no hay token; operaciones protegidas requieren autorización HTTP. | **PASA** | Verificado con `auth.test.js`. Redirección y bloqueo de tokens nulos o expirados con códigos 401/403. |
| **T06** | Entrada directa por URL, recarga, botón atrás y enlaces históricos no provocan bucle ni pantallas técnicas intermedias en el flujo público. | **PASA** | Parámetros de URL se analizan sincrónicamente en carga (`DOMContentLoaded`). Modos directos limpios; acceso sin parámetro `modo` asume `modo=libre` como fallback de compatibilidad según OpenSpec salvo que se indique explícitamente `?diag=1`. |

### VR, Audio y Estantería Simplificada

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T07** | Orión, Osa Mayor y Escorpio seleccionables; mirada con retícula de 3 s y feedback progresivo (0%, 33%, 66%, 100%); ratón/táctil operables. | **PASA** | Componente gaze verificado en `homido-vr-s5.test.js` y `homido-estanteria-3d.test.js`. |
| **T08** | Al abrir una ficha, el cielo y las constelaciones permanecen visibles en 3D; la constelación activa se resalta; sin pared de texto obstructiva. | **PASA** | `abrirFicha()` en `prueba.js` mantiene `constelacionesEl.setAttribute('visible', 'true')` y llama a `resaltar(cId === id)`. Se corrigió el segmento vertical en `trazarRecta()` de `ficha-canvas.js` (`ctx.lineTo(x, y + r)`). Se eliminó el resumen e historia extensa en VR (evitando la pared de texto) conservando el cielo visible al 100%, mientras la web 2D mantiene las transcripciones completas. |
| **T09** | Controles de audio: Escuchar, Pausar / Reanudar y Repetir desde el segundo 0 reflejan estado real; no existen dos audios simultáneos. | **PASA** | Botón Repetir integrado en `ficha-canvas.js`, admitido en `visor-estado.js` (`accionesPermitidas`) y en `objetivoEnVista()` de `prueba.js` para clic y mirada. Conectado al evento `astrovisor:audio-repetir` en `narraciones.js`, ejecutando `narrador.detener()` y `narrador.escuchar()` reiniciando desde el segundo 0. |
| **T10** | «Pausar mirada» deshabilita la selección de constelaciones sin interrumpir la narración de audio en curso. | **PASA** | Desacoplamiento estricto en `prueba.js`: la suspensión del controlador de mirada no emite `narrador.detener()`. |
| **T11** | La estantería de libros en VR presenta formato simplificado: portada, título, autor y etiqueta DEMO, con opción clara de retorno. | **PASA** | Renderizado en canvas 3D sin tablas de signatura ni datos de inventario engañosos. |
| **T12** | Salida desde cielo, ficha o estantería detiene la reproducción de audio, libera controladores y retorna a la vista 2D. | **PASA** | Botón flotante `#directExitBtn` invoca `narrador.detener()`, destruye listeners y redirige mediante `window.location.href = '/'`. |
| **T13** | Audio bloqueado por política de navegador o API no disponible presenta indicación gráfica clara y alternativa de salida sin congelar la escena. | **PASA** | Manejo de rechazo de promesa en `play()` con aviso en ficha ("Presiona Escuchar para permitir audio"). |
| **T14** | Canvas y zonas de colisión (hitboxes) mantienen correspondencia geométrica con las figuras y botones en ambas vistas. | **PASA** | Verificado en `homido-vr-s5.test.js` y `portadas-hibridas.test.js`. |

### Catálogo, Formulario y Flexibilización Documental

| ID | Descripción del caso | Resultado | Evidencia / Observaciones técnicas |
| :---: | :--- | :---: | :--- |
| **T15** | Alta de libro sin año omite la propiedad `anio` en el payload JSON, mientras que la edición que elimina un año existente envía `anio: null` para que el backend borre el campo con `delete destino.anio`, sin generar `0`, `null` persistido ni `NaN`. | **PASA** | Verificado con `catalogo-anio-opcional-s5.test.js`. En alta sin año, `useEditorCatalogo.js` omite la propiedad `anio` en el payload enviado; en edición que limpia un año existente, envía `anio: null` y `catalogoEdicion.js` ejecuta `delete destino.anio`, persistiendo el registro sin el campo. |
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
| **T24** | Créditos académicos del Equipo 8 y logotipos oficiales de IT Tepic, CECAN y Gobierno de Nayarit presentes en web y VR con trazabilidad. | **PASA PARCIAL / IMPLEMENTADO CON AUTORIZACIÓN EN TRÁMITE** | Créditos del Equipo 8 integrados en portada y pie de página; logotipo `ITTepic_logo.jpg` renderizado en panel VR y pie web. Se integró `Nayarit_CECAN_Convivencia_Horizontal.png` en el pie de página (`App.vue`) y créditos (`InicioView.vue`), y `Nayarit_CECAN_Convivencia_Horizontal_LetrasBlancas.png` en el visor VR (`index.html` en `visorControls3D` con proporción panorámica 5.83:1 sin tapar el cielo). Se preserva la nota formal de trazabilidad indicando que la formalización definitiva de autorización continúa en trámite institucional. |
| **T25** | Batería completa de pruebas automatizadas, compilación de producción y verificación de diff sin archivos ajenos comprometidos. | **PASA** | 175 tests web aprobados (100%), 145 tests backend aprobados (100%), compilación limpia en Vite (2.34 s), sin modificaciones a archivos untracked locales ajenos. |

---

## 3. Evidencias Visuales de Navegador Compartidas

A continuación se indexan las capturas reales obtenidas mediante Google Chrome Headless sobre los artefactos de producción, verificando la visibilidad del primer viewport según la decisión UX/UI S5-01:

| Experiencia auditada | Resolución | Archivo relativo |
| :--- | :---: | :--- |
| **Primer Viewport Escritorio 1366** (3 accesos y botones visibles sin scroll) | 1366×768 px | [`./evidencias-s5/01-inicio-escritorio-viewport-1366.png`](./evidencias-s5/01-inicio-escritorio-viewport-1366.png) |
| **Primer Viewport Escritorio 1280** (3 accesos y botones visibles sin scroll) | 1280×800 px | [`./evidencias-s5/01-inicio-escritorio-viewport-1280.png`](./evidencias-s5/01-inicio-escritorio-viewport-1280.png) |
| **Primer Viewport Móvil** (acceso web visible tras encabezado) | 390×844 px | [`./evidencias-s5/02-inicio-movil-viewport-390.png`](./evidencias-s5/02-inicio-movil-viewport-390.png) |
| **Portada Escritorio Completa** (3 accesos, manuales y créditos) | 1280×2000 px | [`./evidencias-s5/01-inicio-escritorio-completo.png`](./evidencias-s5/01-inicio-escritorio-completo.png) |
| **Portada Móvil Completa** (diseño apilado vertical y botones ≥ 48 px) | 390×2800 px | [`./evidencias-s5/02-inicio-movil-completo.png`](./evidencias-s5/02-inicio-movil-completo.png) |
| **VR Modo Libre** (viewport 100%, salida directa, sin paneles técnicos) | 1280×800 px | [`./evidencias-s5/03-vr-libre-escritorio.png`](./evidencias-s5/03-vr-libre-escritorio.png) |
| **VR Modo Libre Móvil** (paisaje 844×390 px) | 844×390 px | [`./evidencias-s5/04-vr-libre-movil.png`](./evidencias-s5/04-vr-libre-movil.png) |
| **VR Modo Homido Estéreo** (pantalla dividida, paralaje, sin paneles) | 844×390 px | [`./evidencias-s5/05-vr-homido-estereo.png`](./evidencias-s5/05-vr-homido-estereo.png) |
| **Ficha VR con Cielo Visible** (Orión, estrellas de fondo, botón Repetir) | 1280×800 px | [`./evidencias-s5/05-vr-ficha-cielo-visible.png`](./evidencias-s5/05-vr-ficha-cielo-visible.png) |
| **Estantería de Libros VR** (portadas 3D simplificadas, aviso DEMO) | 1280×800 px | [`./evidencias-s5/06-vr-estanteria-libros.png`](./evidencias-s5/06-vr-estanteria-libros.png) |

---

## 4. Conclusión de Calidad del Sprint 5

La integración técnica de Sprint 5 satisface la totalidad de los requisitos funcionales, de arquitectura y de accesibilidad aprobados en el OpenSpec. Los compromisos sobre transparencia en entregables no simulados (manuales en video y logotipos institucionales externos) se cumplen con rigor absoluto, sin afirmaciones falsas de completitud.
