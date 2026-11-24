# Proposal: Controles de Navegación Rápida en Administración, Terminología Accesible del Visor e Instrucciones Claras

## Why

En la evaluación de usabilidad y experiencia de usuario realizada con personal bibliotecario y visitantes:
1. **Dificultad de navegación en el panel administrativo:** El panel de administración contiene múltiples secciones verticales extensas (banner, instrucciones pedagógicas, catálogo de experiencias, libros y constelaciones). Los administradores deben hacer scroll manual prolongado cada vez que desean editar libros o constelaciones, ralentizando la gestión documental.
2. **Confusión por término de marca "Homido" aislado:** La presencia de la palabra "Homido" sin contexto descriptivo (como enlace principal en la barra de navegación superior, títulos y estados de catálogo) desconcierta a personas ajenas al proyecto técnico, quienes no identifican que se refiere al visor de realidad virtual para celulares.
3. **Sobrecarga de texto en las instrucciones del visor:** La sección de guía en `VisorView.vue` presenta bloques de texto densos con explicaciones excesivas que dificultan la lectura ágil para el público general y adultos mayores.

## What Changes

- **Barra de navegación rápida / Accesos directos inteligentes en Administración (`AdminPanelView.vue`):**
  - Incorporar una barra de navegación tipo subnav sticky con saltos suaves (`scrollIntoView`) hacia:
    * `Experiencias` (sección de modalidades 2D y 3D).
    * `Catálogo de Libros` (sección bibliográfica).
    * `Constelaciones` (editor de constelaciones).
  - Incluir acción directa `+ Registrar Libro` que hace scroll directo al formulario, invoca la creación de ficha y enfoca el campo de entrada sin navegación manual previa.
  - Añadir botón flotante de retorno superior «Volver arriba».
- **Estandarización de terminología amigable (eliminación de "Homido" aislado):**
  - Sustituir "Homido" en la barra de navegación principal de `App.vue` por "Visor VR".
  - Actualizar títulos de pestaña, botones 3D, estados de sincronización y notas administrativas para referirse a "Visor" o "Visor Celular" cuando el término aparezca solo, conservando la referencia técnica únicamente cuando acompaña descripciones como "gafas Homido o Cardboard".
- **Instrucciones concisas, claras y precisas en `VisorView.vue`:**
  - Reducir el texto de las 5 tarjetas en ~50% con redacción directa y orientada a la acción.
  - Resaltar en negrita los elementos interactivos esenciales («Activar audio y sensores», «3 segundos», «Pausar mirada», «Salir al inicio»).

## Capabilities

### New Capabilities
- `controles-admin-y-terminologia-accesible`: Requisitos de ergonomía de navegación en el panel administrativo, simplificación de instrucciones pedagógicas del visor y adopción de terminología universal sin tecnicismos aislados.

## Impact

- Modificación de `AdminPanelView.vue`, `VisorView.vue`, `App.vue`, `ExplorarView.vue`, `Visor3DView.vue` y `useEditorCatalogo.js`.
- Estilos CSS agregados en `public.css` para la barra de navegación rápida y botón de retorno en administración.
- Pruebas unitarias de navegación y textos actualizadas en `test/inicio-portal-s5.test.js`.
