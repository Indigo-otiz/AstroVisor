# Invitación a la lectura y estantería de demostración

## Motivación
La revisión del Sprint 3 solicitó que la invitación a consultar libros de la biblioteca fuera más visible. No hay acceso a registros bibliotecarios, portadas oficiales ni existencias; la docente autorizó usar ejemplos públicos o datos asumidos, siempre distinguiendo simulación y realidad.

## Cambios
- Sustituir la lista bibliográfica de la vista 2D de cada constelación por una invitación grande y explícita a explorar lecturas.
- Crear un recorrido 2D enlazable: estantería simplificada con tres portadas ilustrativas, ficha individual con motivo de lectura, título, autor y enlace a obra pública.
- Mostrar identificadores MARC 21 ficticios **claramente rotulados** como ejemplo de `001/003`, con `852` pendiente. Nunca afirmar que la biblioteca tiene esos libros ni que están disponibles.
- Reutilizar las tres referencias públicas ya documentadas en `content/recorridos.json`, sin modificar el JSON compartido ni el visor/audio.
- Conservar rutas independientes, facilidad de lectura y elementos pulsables grandes para adultos mayores.

## Fuera de alcance
Integración con ILS/catálogo MARC 21 real, consulta de existencias, imágenes oficiales de cubierta, préstamos, más constelaciones y rediseño general de Figma.

## Impacto
Ruta y archivos de Vue públicos, catálogo JSON de demostración, ilustraciones locales, OpenSpec y pruebas. No se alteran contratos API, autenticación, audio ni escena Homido.
