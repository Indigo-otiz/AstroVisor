# Invitación a la lectura y estantería de demostración

## Motivación
La revisión del Sprint 3 solicitó que la invitación a consultar libros de la biblioteca fuera más visible. No hay acceso a registros bibliotecarios, portadas oficiales ni existencias; la docente autorizó usar ejemplos públicos o datos asumidos, siempre distinguiendo simulación y realidad.

## Cambios
- Sustituir la lista bibliográfica de la vista 2D de cada constelación por una invitación grande y explícita a explorar lecturas.
- Crear un recorrido 2D enlazable: estantería simplificada con tres portadas ilustrativas, ficha individual con motivo de lectura, título, autor y enlace a obra pública.
- Mostrar identificadores MARC 21 ficticios **claramente rotulados** como ejemplo de `001/003`, con `852` pendiente. Nunca afirmar que la biblioteca tiene esos libros ni que están disponibles.
- Reutilizar las tres referencias documentadas en `content/recorridos.json`, conservando la estructura del contrato y el reproductor de audio. Corregir las dos URLs bibliográficas autorizadas y sincronizar su respaldo. Añadir navegación bibliográfica a Homido: ficha → estantería → detalle → consulta 2D y regreso.
- Conservar rutas independientes, facilidad de lectura y elementos pulsables grandes para adultos mayores.

## Fuera de alcance
Integración con ILS/catálogo MARC 21 real, consulta de existencias, imágenes oficiales de cubierta, préstamos, más constelaciones y rediseño general de Figma.

## Impacto
Rutas y archivos de Vue públicos, catálogo JSON de demostración, ilustraciones locales, OpenSpec y pruebas. La escena Homido incorpora estantería, ficha breve y estados/zonas de navegación de libros; conserva las funciones previas de selección por mirada, renderizado estéreo y narración. No cambia el contrato API, autenticación, controlador dwell ni reproductor de audio. Esta aclaración de alcance no constituye una prueba física ni autoriza integración.
