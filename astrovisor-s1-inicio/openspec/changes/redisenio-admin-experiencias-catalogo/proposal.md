# Proposal: Rediseño Integral de Administración, Catálogo Completo y Armonización Visual

## Why

1. **Saturación y fatiga visual:** El acceso y panel administrativo presentaban fondos desalineados, halos amarillos molestos y fondos azules planos que dificultaban la lectura prolongada por parte del personal bibliotecario.
2. **Navegación vertical infinita:** Todo el contenido (banner, guías pedagógicas, experiencias, libros y constelaciones) residía en una única pantalla con scroll prolongado, entorpeciendo la localización de títulos.
3. **Catálogo incompleto en vista administrativa:** Solo se visualizaban los primeros libros en lugar de los 18 títulos completos integrados en la base de datos de la biblioteca.
4. **Textos y botones sobrecargados:** Botones como "Editar [Título largo]" generaban tarjetas desproporcionadas; existían símbolos duplicados ("++") y mensajes de confirmación con jerga técnica sobre sincronizaciones internas que confundían al usuario.

## What Changes

- **División por pestañas en Administración (`AdminPanelView.vue`):**
  - Vista modular por pestañas: **[Editar libros]** (con contador de 18 libros) y **[Constelaciones]** (con 4 recorridos celestes).
  - Eliminación de secciones obsoletas: *"Cómo usar"* y *"Experiencias disponibles"* (estas últimas reservadas para la vista pública).
- **Integración y búsqueda del catálogo completo:**
  - Despliegue de los 18 libros bibliográficos con portadas, autores y relaciones estelares.
  - Buscador reactivo en tiempo real para libros (por título, autor, id o constelación) y para constelaciones.
- **Estandarización de controles y acciones:**
  - Botón de registro unificado `+ Registrar libro` reubicado directamente en la sección de libros.
  - Botón de tarjeta simplificado a etiqueta concisa `Editar`.
  - Mensaje de confirmación amigable: `¡Cambios guardados con éxito en el catálogo!`, acompañado de alerta visual con icono de verificación y botón de cierre.
- **Rediseño estético y armonización de color:**
  - Reemplazo del halo amarillo de login por un cielo estrellado cósmico tenue (`admin-login-bg.jpg`).
  - Eliminación de todos los textos y fondos amarillos chillantes en alertas y barras de demostración, sustituidos por tonos pizarra/acero neutros.
  - Sustitución de la franja azul sólida del hero por un degradado cósmico profundo a juego con las constelaciones.
  - Sustitución del fondo azul duro de las tarjetas de libros por un canvas difuminado suave que resalta las portadas.
- **Unificación de controles en el visor:**
  - Botón de cierre directo `✕` en lugar del texto extenso "Volver al cielo".
  - Reemplazo del término técnico aislado "Homido" por "Visor VR".
  - Reducción del texto de preparación y tarjetas explicativas.

## Capabilities

### New Capabilities
- `admin-pestanas-y-catalogo-completo`: Navegación segmentada inmediata para libros y constelaciones sin scroll vertical, con búsqueda integrada y carga de los 18 volúmenes de la biblioteca.
- `armonizacion-visual-sin-amarillos`: Estándar estético cósmico de alto confort visual, paleta pizarra/acero y mensajes claros orientados al bibliotecario.
