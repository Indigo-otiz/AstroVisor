# Design — S5: AstroVisor — Arquitectura de Experiencias, Audio y Contenido

## 1. Arquitectura General y Separación de Canales

El sistema mantiene su arquitectura modular monolítica con almacenamiento documental JSON en el backend y dos experiencias cliente diferenciadas que comparten el mismo catálogo publicado:

```text
                               ┌──────────────────────────┐
                               │  Inicio (InicioView.vue) │
                               └────────────┬─────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
      ┌─────────────────┐         ┌────────────────────┐         ┌─────────────────┐
      │  Tarjeta 1: Web │         │   Tarjeta 2: VR    │         │ Tarjeta 3: Adm  │
      │   /explorar     │         │  /prueba-homido/   │         │    /admin       │
      └────────┬────────┘         └─────────┬──────────┘         └────────┬────────┘
               │                            │                             │
        (Web / Proyección)     ┌────────────┴────────────┐          (Panel seguro)
                               ▼                         ▼
                       modo=libre             modo=homido
                   (Ventana completa)    (Pantalla dividida)
                   (Mouse / Tactil)      (Sensores / Mirada)
```

Debajo de las tarjetas, se integra la sección accesible de **Manuales en Video** y **Créditos Académicos e Identidad**.

---

## 2. Decisiones Técnicas Detalladas

### 2.1 Nueva Portada `InicioView.vue` (S5-01 / S5-03)
* **Estructura HTML Semántica:** Contenedor `<main class="home-portal">` con tres elementos `<article class="access-card">` de alto contraste:
  1. *Experiencia Web Educativa:* Botón prominente `router-link` a `/explorar`.
  2. *Experiencia VR:* Contiene dos botones independientes:
     - `a.vr-action[href="/prueba-homido/index.html?modo=libre"]`: Pantalla completa · mouse o dedo.
     - `a.vr-action[href="/prueba-homido/index.html?modo=homido"]`: Visor Homido · pantalla dividida.
  3. *Administración:* Botón `router-link` a `/admin`, interceptado por el guard de sesión existente (`requiresAdmin`).
* **Sección de Manuales en Video (S5-05):** Contenedor `<section class="home-manuals">` con pestañas o tarjetas para los 3 manuales: Web, VR y Administración. Cada uno incluye título, descripción pedagógica, reproductor con controles accesibles, transcripción desplegable y etiqueta de estado de producción (`PENDIENTE DE GRABACIÓN`).
* **Créditos Académicos (S5-06):** Sección inferior explícita que acredita al Equipo 8: Karime Rendón Vázquez, Luis Alberto Rodríguez, Carlos Martínez Orozco e Índigo Andre Ortiz Vega, junto al logo de IT Tepic y la Biblioteca Solón Argüello.

### 2.2 Escena VR Limpia y Modos Directos (S5-02)
* **Resolución de Parámetros de URL:** `prueba.js` analiza `new URLSearchParams(window.location.search)`:
  - `modo === 'homido'`: Abre **directamente** la escena estereoscópica activando `js/estereo.js`, retícula guía, cursor de mirada (gaze-dwell de 3 s). Si el navegador requiere interacción del usuario para activar sensores (`DeviceOrientationEvent`) o audio, se despliega un control mínimo y discreto superpuesto dentro de la propia experiencia 3D, **sin retroceder a la página técnica de preparación** ni bloquear el render inicial.
  - `modo === 'libre'` (por defecto si no se indica modo): Abre **directamente** el recorrido 3D monoscópico a ventana completa, con cámara orientable por arrastre de ratón y gestos táctiles (`look-controls`), sin pantalla dividida ni requisitos de orientación.
* **Supresión Definitiva de Paneles Técnicos:** Los bloques HTML de depuración (`.site-header`, `.controls-panel`, `.reading-panel` y `.log-panel`) se ocultan en el flujo público habitual, permitiendo que la escena A-Frame `#sceneHost` ocupe el 100% del viewport (`100vw`, `100vh`, `position: fixed; top: 0; left: 0; z-index: 10`).
* **Parámetro de Diagnóstico (`?diag=1`):** Se conserva íntegro exclusivamente para pruebas técnicas y desarrollo, sin intervenir en la experiencia pública.
* **Política de Entregables Parciales y Bloqueos:**
  - Los 3 manuales en video (S5-05) se implementan con su estructura UI, guiones técnicos y transcripciones completas, pero su estado de avance se mantiene estrictamente como **`PENDIENTE DE GRABACIÓN`** hasta contar con los archivos multimedia reales.
  - Los logotipos de CECAN y Gobierno (S5-06) permanecen en estado **`BLOQUEADA EXTERNAMENTE`** y no se consideran implementados en tanto no se disponga de los activos oficiales autorizados.

### 2.3 Cielo Visible Durante la Narración (S5-02)
* **Problema técnico actual:** En `prueba.js`, `abrirFicha(id)` ejecutaba `activarGrupo(constelacionesEl, false)`, desvaneciendo las estrellas y levantando un gran plano frontal opaco (`#infoPanel3D` con `#cardCanvas`).
* **Solución de arquitectura:**
  1. `constelacionesEl` se mantiene **visible** (`activarGrupo(constelacionesEl, true)`).
  2. La constelación activa incrementa su opacidad o emisividad visual, mientras las demás reducen su interacción seleccionable para evitar disparos accidentales de constelaciones vecinas durante la narración.
  3. `#infoPanel3D` se reposiciona ligeramente en el campo visual (inferior o lateral) con fondo translúcido oscuro accesible, permitiendo que la figura de estrellas permanezca visible de fondo.
  4. Rediseño de `ficha-canvas.js`: El canvas de 1400×1200 elimina el bloque denso de texto narrativo. Presenta:
     - Título de la constelación (tipografía grande y nítida).
     - Rótulo breve de origen cultural.
     - Controles interactivos con coordenadas precisas (`calcularLayout`):
       - Botón **Escuchar / Pausar / Reanudar** (control de audio).
       - Botón **Repetir desde el inicio** (reinicia el audio a 0s).
       - Botón **Ver libros recomendados** (abre estantería simplificada).
       - Botón **Volver al cielo** (cierra la ficha y reactiva selección general).
       - Botón **Salir** (retorna a la web).
* **Desacoplamiento de Pausa:** El botón "Pausar mirada" (`data-action="pausa"`) únicamente detiene el progreso del raycast/anillo de dwell. La narración de audio continúa reproduciéndose sin interrupción.

### 2.4 Simplificación de Libros en VR (S5-02 / S5-07)
* La estantería 3D y la vista de libro en VR muestran exclusivamente:
  - Portada ilustrativa.
  - Título y autor.
  - Indicador discreto `DEMO`.
  - Botón "Volver a constelación" y sugerencia breve para consultar la ficha completa en la web 2D.
* No se renderizan párrafos extensos de sinopsis ni datos técnicos de biblioteca dentro del visor.

### 2.5 Flexibilización del Formulario de Catálogo (S5-03)
* **Campo Año Opcional:**
  - `AdminPanelView.vue`: Se elimina el atributo `required` del input de año. Si el valor es cadena vacía o espacios, se envía como `undefined` o se omite del payload.
  - `useEditorCatalogo.js` y `catalogoAdminService.js`: Validación que tolera ausencia de `anio`, evitando transformaciones que generen `0` o `NaN`.
  - `catalogoEdicion.js` en backend: Ya valida `anio === undefined || (typeof anio === 'number' && Number.isInteger(anio))`. Se comprueba y cubre con tests unitarios específicos.
* **Enlace Público HTTPS:** Se mantiene obligatorio conforme al contrato validado en S4.
* **Preservación MARC 21:** Los campos `marc21.campo001` y `marc21.campo003` mantienen sus valores actuales `DEMO-001` y `DEMO`. La asignación de números de control oficiales se registra como dependencia bloqueada hasta que la biblioteca entregue su registro y política oficial.

### 2.6 Identidad y Logos en VR y Web (S5-06)
* En la escena VR, se incorpora un plano sutil con la imagen `ITTepic_logo.jpg` en la zona de controles inferiores/retorno, dimensionado con escala proporcional sin obstruir el campo de visión central ni la mirada hacia las constelaciones.
* Se mantiene el footer institucional de la web con Solón Argüello, TecNM e IT Tepic.

---

## 3. Matriz de Contenido por Experiencia (S5-07)

| Atributo / Campo | Web Educativa (`/explorar`) | VR Modo Libre (`?modo=libre`) | VR Modo Homido (`?modo=homido`) | Panel Admin (`/admin`) |
| :--- | :--- | :--- | :--- | :--- |
| **Cielo / Visual** | Gráfico 2D SVG / Canvas | Escena 3D monoscópica interactiva | Escena 3D estereoscópica dividida | Vista previa de recursos |
| **Constelación** | Título, resumen, historia completa, estrellas | Cielo visible, figura resaltada, título corto | Cielo visible, figura resaltada, título corto | Edición de títulos y coordenadas |
| **Narración** | Reproductor con transcripción accesible | Audio interactivo (play, pausa, repetir) | Audio con selección por mirada (play, pausa, repetir) | Metadatos y archivo de audio |
| **Libros** | Ficha completa, sinopsis, relación, enlace | Portada, título, autor, etiqueta DEMO | Portada, título, autor, etiqueta DEMO | Edición completa (año opcional) |
| **Controles** | Teclado, ratón, lector de pantalla | Ratón (drag/click) y toques táctiles | Mirada fija 3 s (dwell) y toques | Formularios y botones estándar |
| **Avisos DEMO** | Pie de página y texto demostrativo | Rótulo discreto DEMO | Rótulo discreto DEMO | Estado de publicación |
