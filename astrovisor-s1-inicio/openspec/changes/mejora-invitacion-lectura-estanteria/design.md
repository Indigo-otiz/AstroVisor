# Diseño de la estantería de libros

## Flujo
`/explorar/:id` → botón «Descubre los libros sobre ...» → `/biblioteca/:id` → elección de cubierta → detalle (incluida lectura externa) → volver a constelación.

## Datos
El adaptador `frontend/src/services/biblioteca.js` toma los datos de `libros[]` ya proporcionados por la API de recorridos. No persiste un catálogo adicional ni modifica el JSON de Carlos. Presenta inicialmente 3 obras históricas existentes, destacando la de la constelación de origen.

Las cubiertas son ilustraciones CSS, explícitamente **no cubiertas editoriales reales**. El libro y enlace externo son referencias públicas incluidas en el repositorio; no se promete ejemplar físico.

## MARC 21
En una versión posterior, un adaptador podrá recibir opcionalmente `libro.catalogo = { confirmadoBiblioteca, agencia003, control001, ubicacion, signatura }`. Sin `confirmadoBiblioteca: true`, los valores se ocultan para impedir mostrar una localización falsa. `001` es número de control, `003` identifica su organismo, mientras la signatura/ubicación (a menudo del registro de existencias, p. ej. 852) sirve para encontrar el ejemplar. Ninguno se infiere del ISBN.

## Accesibilidad
Portadas grandes frontales, botones nativos con objetivo amplio, foco visible, un detalle legible, mensaje explícito de demostración y salida clara al recorrido. Sin carrusel automático ni animaciones necesarias. Por ahora, estantería **solo 2D**; el visor 3D permanece sin cambios.

## Riesgos
La ausencia de un catálogo confirmado impide afirmar propiedad, ubicación o disponibilidad física. Las rutas Vue requieren prueba manual y build; las pruebas de adaptador no sustituyen pruebas en teléfono.
