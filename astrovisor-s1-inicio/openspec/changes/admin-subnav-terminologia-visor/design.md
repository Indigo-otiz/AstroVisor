# Design: Controles de Navegación Rápida en Administración y Claridad de Interfaz

## Contexto y Decisiones de Arquitectura

### 1. Barra de Accesos Directos vs. Barra CRUD Flotante en Administración
- Se descartó una barra flotante con CRUD completo porque exigiría selectores adicionales para elegir qué libro o constelación editar, duplicando controles de la interfaz y saturando la vista.
- Se implementó una **Barra de Accesos Directos Inteligente (Pill Subnav)** adherente (`sticky`), colocada estratégicamente bajo el encabezado administrativo:
  - Enlaces de salto suave (`behavior: 'smooth'`) con IDs específicos: `#seccion-experiencias`, `#catalogo-heading`, `#constelaciones-editor`.
  - Acción directa destacada `+ Registrar Libro` que ejecuta la función `nuevoLibro()`, desplaza la pantalla hasta `#editor-heading` y enfoca automáticamente el primer campo del formulario.
  - Botón flotante accesible en la esquina inferior derecha que se muestra al desplazarse hacia abajo para regresar arriba con un clic.

### 2. Tratamiento del Término de Marca "Homido"
- La palabra aislada genera confusión en visitantes no técnicos.
- Se reemplazan las apariciones aisladas por términos universales:
  - En el menú principal de navegación: `Visor VR`.
  - En estados y avisos de sistema: `el visor` o `del visor`.
  - Se mantiene la referencia específica únicamente en párrafos descriptivos donde se aclara la compatibilidad de hardware (ej. "gafas Homido o Cardboard").

### 3. Síntesis Pedagógica de Instrucciones en VisorView
- Las 5 tarjetas de guía y seguridad en `VisorView.vue` conservan su estructura HTML/CSS nativa (`.visor-step-card` y `.visor-feature-box`), evitando rediseñar la vista.
- Se depura la redacción retirando explicaciones accesorias y enfatizando la acción directa en menos de 25 palabras por tarjeta.
