# Propuesta

## Why

Como visitante quiero escuchar historias del cielo a mi ritmo, con posibilidad de pausar. La revisión del 10 de noviembre priorizó simplificar el acceso y la lectura en el visor. El informe de Karime documenta pasos de entrada excesivos, controles que compiten, dificultad para orientarse y textos densos para personas adultas mayores.

## What Changes

- Desde Inicio ofrecer la escena a pantalla completa para ratón y tacto, y la escena estereoscópica para Homido. Mantener el acceso a la web 2D sin cuenta. Llevar la consola y los paneles técnicos a la ruta de diagnóstico.
- Reducir la ficha al título, estado y controles de narración, libros y regreso. Mantener el cielo y la figura seleccionada visibles mientras se escucha.
- Refinar los audios demo de Orión, Osa Mayor y Escorpio y comprobar volumen, duración, escucha, pausa, reanudación y repetición. Mantener en web el relato y la transcripción completa, incluso cuando falle el audio.
- Simplificar los libros inmersivos a portada, título, autor y marca DEMO cuando corresponda. Mantener acceso a la ficha completa en la web y conservar los datos fuente.
- Registrar pruebas, evidencia visual por modo y la escucha de los tres audios demo. Las conclusiones físicas de S5 dependerán de lo que se pruebe en dispositivos y visor reales.

## Capabilities

### New Capabilities

- `experiencia-inmersiva-publica` define los dos accesos, la ficha centrada en narración y el recorrido verificable de salida.

### Modified Capabilities

El directorio local de especificaciones principales está vacío. El cambio complementa las capacidades de los incrementos abiertos de selección por mirada, narración y biblioteca, y preserva los controles y el desmontaje de S4.

## Impact

El trabajo se concentra en Inicio, la página A-Frame, sus controles compartidos, las pruebas frontend y la evidencia de S5. Se reutilizan el reproductor, los recursos de voz demo, los datos públicos y el respaldo existente. Se mantiene la proyección web de S4 y se actualizan los pasos de uso en `/visor`.

Responsable de S5: Luis Alberto Rodríguez. El periodo académico original fue del 9 al 13 de noviembre de 2026. El ajuste P0 recoge la revisión del 10 de noviembre. La QA del PR #12 es antecedente de S4. El 14 de noviembre, Luis indicó que, según Índigo, el cierre podía continuar sin revisión externa. Las narraciones institucionales definitivas requieren permisos. Los comentarios de la biblioteca se incorporarán si existe una fuente confirmada. OpenSpec queda como insumo interno.
