# Tasks

Estado: plan aprobado en el chat. Las casillas marcadas se respaldan en docs/PRUEBA-LOGOS-3D.md.

## 1. Preparación

- [x] 1.1 Tras aprobación, revisar la base remota y preparar una rama distinta de main sin incorporar archivos locales ajenos; comprobar rama, estado y diff de archivos.
- [x] 1.2 Ejecutar las suites disponibles como referencia y registrar los fallos preexistentes por separado, con comandos y resultados reales.

## 2. Recursos y geometría

- [x] 2.1 Preparar contornos simplificados de los dos adjuntos conservando colores, proporciones y huecos; comparar recursos con las imágenes fuente y registrar procedencia y limitación de resolución.
- [x] 2.2 Construir relieves con Three.js existente y liberación de geometría/materiales; añadir prueba enfocada de profundidad positiva, huecos, dimensiones y limpieza, y comprobar que pasa.
- [x] 2.3 Cargar cada emblema con fallo aislado; comprobar con recurso ausente que el otro emblema, la cámara y la salida siguen operativos.

## 3. Escena

- [x] 3.1 Incorporar grupo fijo detrás de la cámara inicial, separado de los controles y objetivos seleccionables, con iluminación de relieve; comprobar transformaciones y vista frontal y oblicua en navegador.
- [x] 3.2 Retirar de la escena CECAN y las imágenes planas anteriores; actualizar homido-vr-s5.test.js y comprobar que las aserciones reflejan las dos identidades actuales y que la web 2D conserva sus recursos.
- [x] 3.3 Ampliar ambos emblemas y ajustar sus escalas independientemente, distancia y separación; capturar entrada, giro posterior y vista oblicua en pantalla y estéreo, comprobando en cada ojo encuadre completo, inscripciones y ausencia de solapamientos; documentar dimensiones, posición, geometría y la distinción entre navegador y hardware físico.

## 4. Verificación conjunta y PR

- [x] 4.1 Ejecutar npm run test:web, npm test, npm run build, openspec validate logos-institucionales-relieve-3d --strict y git diff --check; registrar resultados y fallos reales.
- [x] 4.2 Comprobar build servido, apertura/cierre de ficha, narración y salida en pantalla y estéreo; confirmar que los logos no se desplazan con los controles y registrar evidencias y pendientes físicos.
- [x] 4.3 Revisar el diff y publicar únicamente la rama del cambio; abrir PR contra main con alcance, verificaciones, capturas y limitaciones, sin push directo ni merge a main; entregar su enlace.

Entrega: PR #14 — https://github.com/Indigo-otiz/AstroVisor/pull/14

## Workflow follow-up

- Solicitar aprobación separada antes de archivar el cambio OpenSpec.
- No acreditar pruebas físicas Homido hasta disponer de evidencia real.
