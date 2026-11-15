# Proposal — S5: AstroVisor — Experiencias Diferenciadas, Audio y Contenido

## Contexto y Autorización

Propuesta técnica preparada para el **Sprint 5 (9–13 de noviembre de 2026)** de AstroVisor (Taller Full Stack, Equipo 8), basada en el brief rector de implementación y las directrices acordadas.

### Distribución de Responsabilidades Académicas y Autoría Técnica
Conforme a los roles rectores del proyecto:
- **Karime Rendón Vázquez (`Liz-Kalu`):** Coordinación de UX/UI, diseño de interacción y accesibilidad (S5-01); coordinación transversal de manuales en video (S5-05) y de créditos e identidad (S5-06).
- **Carlos Martínez Orozco (`CarlosQuinto5to`):** Coordinación de implementación web, componentes públicos, catálogo bibliográfico y formularios administrativos (S5-03).
- **Luis Alberto Rodríguez (`LuisMaster119`):** Coordinación de la experiencia VR, modos monoscópico/estereoscópico, controles de mirada y reproducción de audio con escena visible (S5-02).
- **Índigo Andre Ortiz Vega (`Indigo-otiz`):** Coordinación de integración, persistencia documental, matriz de contenidos (S5-07) y aseguramiento de calidad / pruebas transversales (S5-04).
- **Antigravity (Asistente de Desarrollo):** Ejecución técnica asistida bajo delegación explícita del equipo, registrando la autoría en commits con los nombres y correos institucionales correspondientes a cada área, manteniendo estricta trazabilidad sin asumir la titularidad académica.

## Why

Tras las entregas de S4 (persistencia documental, proyección web, menú Homido y QA físico), la retroalimentación técnica y académica identificó que:
1. La portada inicial carece de una jerarquía clara: no distingue visualmente el acceso a la web convencional, al visor inmersivo y a la administración, forzando pasos intermedios por `/visor`.
2. Al seleccionar una constelación en VR, la escena oculta el cielo 3D y muestra una ficha blanca densa de texto en 2D/3D, rompiendo la sensación de inmersión y saturando de texto en lugar de priorizar el audio.
3. No existe una entrada limpia y directa a una versión 3D monoscópica para pantalla completa (uso con mouse o dedo) diferenciada del render estereoscópico para visor Homido (pantalla dividida).
4. El formulario de libros exige actualmente el año de publicación cuando puede no estar disponible en libros antiguos o demostrativos; además, no se dispone aún de registros MARC 21 reales autorizados por la biblioteca.
5. Faltan los tres manuales obligatorios para usuarios finales (Web, VR, Admin) y la acreditación formal del Equipo 8 junto con la identidad de IT Tepic en VR.

## What Changes

1. **Nueva portada de tres accesos directos (`InicioView.vue`):**
   - **Tarjeta 1 — Web educativa / pantalla grande:** Enlace directo a `/explorar` sin pantallas intermedias. Conserva la vista de proyección y lectura 2D.
   - **Tarjeta 2 — Experiencia VR (dos acciones directas):**
     - Botón *«Pantalla completa · mouse o dedo»* (`/prueba-homido/index.html?modo=libre`): escena 3D monoscópica a ventana completa, sin paneles técnicos alrededor, operable por arrastre/tacto.
     - Botón *«Visor Homido · pantalla dividida»* (`/prueba-homido/index.html?modo=homido`): escena estereoscópica inmediata para smartphone/visor, con retícula y selección por mirada (dwell time de 3 s).
   - **Tarjeta 3 — Administrador:** Enlace a `/admin` protegido por el guard de sesión existente (redirección a `/admin/acceso` para no autenticados).
2. **Cielo y constelación visible durante la narración en VR (`prueba.js`, `ficha-canvas.js`):**
   - `abrirFicha()` ya no oculta `constelacionesEl`. La constelación seleccionada se resalta en el cielo.
   - La ficha inmersiva se simplifica a título, resumen mínimo y controles compactos de audio: *Escuchar*, *Pausar/Reanudar* y *Repetir desde el principio*.
   - El botón «Pausar mirada» desacoplado totalmente del audio: detener la permanencia de mirada no silencia la narración.
   - Visualización de libros en VR reducida a portada, título, autor y etiqueta DEMO; los detalles extensos se consultan en la web 2D.
3. **Contrato bibliográfico seguro y año opcional (S5-03):**
   - En `AdminPanelView.vue`, `useEditorCatalogo.js` y `catalogoEdicion.js`, el campo `año` pasa a ser opcional en el alta y edición (sin emitir `anio: 0` ni `NaN`).
   - El enlace público HTTPS se mantiene como requisito obligatorio conforme al contrato validado actual.
   - Los identificadores técnicos `id` tipo slug y los códigos `marc21.campo001: "DEMO-001"` se preservan estables sin inventar datos institucionales.
4. **Manuales en video (S5-05):**
   - Incorporación de sección de manuales bajo las tarjetas de inicio: *«Cómo usar la web»*, *«Cómo explorar en VR»* y *«Cómo administrar»*.
   - Desarrollo de guiones técnicos estructurados, especificaciones y componentes accesibles.
   - Dado que no se dispone de grabaciones reales en esta sesión técnica, los videos se registran formalmente como **`PENDIENTES DE GRABACIÓN`**, sin simular su completitud.
5. **Créditos académicos e identidad institucional (S5-06):**
   - Crédito formal en la web: «AstroVisor — proyecto académico del Equipo 8» con los nombres de Karime Rendón Vázquez, Luis Alberto Rodríguez, Carlos Martínez Orozco e Índigo Andre Ortiz Vega.
   - Logotipo del Instituto Tecnológico de Tepic integrado de forma no invasiva en la escena VR (en áreas de pausa/salida).
   - Logos oficiales de CECAN y Gobierno clasificados como **`BLOQUEADA EXTERNAMENTE`** hasta recibir los activos aprobados y autorización expresa.
6. **Matriz de contenido por modalidad (S5-07) y QA transversal (S5-04):**
   - Matriz única de contenidos que especifica qué se presenta en Web, VR libre, Homido y Admin a partir del mismo catálogo documental.
   - Batería de validación y regresión T01–T25.

## Capabilities

### New Capabilities
- `navegacion-portada`: Portada accesible con tres tarjetas de acceso directo, integración de manuales en video y créditos académicos.
- `inmersion-auditiva-cielo`: Escena 3D autónoma con dos modalidades explícitas (`libre` y `homido`), permanencia visual del cielo nocturno y controles de audio compactos.
- `catalogo-bibliografico-s5`: Flexibilización de campos bibliográficos con año opcional, validación estricta y preservación de trazabilidad DEMO / MARC 21.
- `manuales-e-identidad`: Componentes accesibles para manuales en video, créditos formales del Equipo 8 e identidad no invasiva en VR.

### Modified Capabilities
Ninguna especificación base consolidada se modifica de forma destructiva; se extienden las capacidades de `gestion-documental` y `controles-homido-narracion` de los sprints previos.

## Impact

- **Frontend (`InicioView.vue`, `public.css`):** Nueva arquitectura visual accesible, tipografías y contrastes verificados.
- **VR (`prueba-homido/index.html`, `prueba.js`, `ficha-canvas.js`):** Escena adaptable a ventana completa, supresión de paneles HTML en flujo público (preservables con `?diag=1`), retención de `constelacionesEl`.
- **Backend / Admin (`AdminPanelView.vue`, `catalogoEdicion.js`, tests):** Aceptación de registros sin año, regresión de API documental y cobertura de pruebas.
- **Ramas y Git:** Trabajo en ramas específicas por área; cero merges directos a `main`.
