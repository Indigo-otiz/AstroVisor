# S1 — Prueba técnica de orientación, visor Homido y alternativa 2D

**Estado:** prototipo de prueba preparado; **validación física pendiente**. Esta actividad cubre de forma temporal una tarea asignada originalmente a Luis; no se afirma que él la haya ejecutado.

## Acceso a la página

La escena se sirve con Vite desde `frontend/public/prueba-homido/` y puede abrirse en:

- `http://localhost:5173/prueba-homido/` (prueba en computadora local)
- `https://<dominio-https-del-equipo>/prueba-homido/` (prueba en teléfono físico)

Desde `astrovisor-s1-inicio/` ejecutar `npm ci`, `npm run dev:api` y `npm run dev:web`. Solo Vite es necesario para la escena, pero se conserva el arranque del proyecto completo.

**IMPORTANTE:** abrir `http://IP_LOCAL:5173` desde el teléfono no equivale a HTTPS: los eventos de orientación y los permisos pueden estar restringidos. Servir mediante HTTPS auténtico (p. ej., un despliegue temporal de pruebas o un túnel HTTPS confiable). Evitar enlaces `file://`. El navegador necesita conexión a Internet para cargar la versión fija de A-Frame 1.8.0 desde `https://aframe.io/releases/1.8.0/aframe.min.js`.

## Qué implementa

- Escena A-Frame mínima con objetivo central y retícula (`fuse: true`, 1800 ms).
- Solicitud explícita de permiso de orientación donde existe `DeviceOrientationEvent.requestPermission()`.
- Visualización de muestras de orientación sin guardar datos en un servidor; no comprueba por sí sola que la cámara se mueva.
- Modo 2D convencional con mouse/gestos, acceso permanente a `/explorar` y registro de eventos copiable.
- **Renderizado estereoscópico experimental**: dos cámaras virtuales por ojo dibujadas sobre el mismo canvas con scissor y viewport. No es WebXR/Cardboard nativo ni una corrección de lentes calibrada. Su funcionamiento físico requiere prueba real.
- Botón para desactivar vista dividida; también intenta salir cuando se cierra pantalla completa. Retirar el teléfono del visor si hay molestias.

La versión moderna de A-Frame no incluye el antiguo modo Cardboard de forma garantizada. Por ello no se usa `enterVR()` como prueba de compatibilidad con Homido; se prueba una vista partida propia y se anota que es **experimental**.

## Protocolo de prueba física — un dispositivo real

1. Registrar **fecha, nombre del evaluador, modelo exacto del teléfono, modelo de visor Homido, sistema operativo, versión del navegador y URL HTTPS**.
2. Abrir `/prueba-homido/` en modo 2D, comprobar que carguen la escena y el objetivo, y que el botón de retorno lleve a `/explorar`.
3. Pulsar **Solicitar sensores**; aceptar/rechazar permisos según el caso. Mover suavemente el teléfono y comprobar que cambian los valores `α, β, γ`. Luego verificar visualmente si la cámara **sigue** el movimiento (son dos resultados diferentes).
4. Sin tocar pantalla, mantener el centro de la vista sobre la esfera naranja durante ~1.8 s. Confirmar cambio de color y evento de selección. **Repetir con movimiento de cabeza** tras insertar el teléfono en Homido si procede.
5. Activar **Probar vista dividida**, girar el teléfono horizontalmente y colocar el teléfono en el visor. Verificar: dos imágenes, fusión visual cómoda y selección. Si hay incomodidad, detener de inmediato. La existencia de dos imágenes **no garantiza** compatibilidad óptica ni comodidad.
6. Extraer el teléfono del visor, desactivar modo dividido y regresar a `/explorar`. Registrar cómo respondió el sistema. En un equipo sin permiso, sensores o soporte, comprobar que 2D sigue siendo utilizable.
7. Copiar registro de la sesión, tomar capturas y anotar **aprobado/falló/no probado** con evidencia para cada criterio. Si una operación falla, **no completar como aprobada**.

## Matriz de resultados (rellenar solamente después de probar)

| Criterio | Resultado | Evidencia y observaciones |
|---|---|---|
| Página accesible por HTTPS en teléfono | No probado | |
| Escena 2D y navegación | No probado | |
| Permisos y valores de sensores | No probado | |
| Cámara gira según orientación física | No probado | |
| Retícula y selección sin toque | No probado | |
| Vista dividida visible | No probado | |
| Visión cómoda con Homido | No probado | |
| Salida y regreso al modo 2D | No probado | |
| Ausencia o rechazo de permisos | No probado | |

**Datos de la sesión:** fecha: ___; evaluador: ___; teléfono: ___; SO: ___; navegador: ___; visor: ___; URL HTTPS: ___.

**Conclusión preliminar:** pendiente hasta recibir evidencia del teléfono y del Homido. Solo el código y la comprobación sintáctica pueden verificarse sin hardware.

## Evidencias mínimas para entrega S1

- Código fuente de la página, versión y commit/PR.
- Captura de la escena normal y de vista dividida.
- Registro copiado desde la página y matriz con dispositivo y navegador.
- Fotografía o video de prueba con el visor cuando sea posible, con autorización de quienes aparezcan.
- Limitaciones e incidencias, en particular problemas de permisos, seguimiento y comodidad.

## Criterios de cierre

La tarea no debería darse por **Terminada** hasta efectuar y documentar la validación física por parte de quien dispone del Homido, y registrar revisión cruzada del equipo. El código creado no sustituye los resultados del dispositivo.

## Referencias técnicas

- A-Frame 1.8.0, instalación y escenas: https://aframe.io/docs/1.8.0/introduction/installation.html
- A-Frame, cursor y fuse: https://github.com/aframevr/aframe/blob/master/docs/components/cursor.md
- MDN, solicitud de permiso de sensores: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static
- A-Frame: cambios en soporte de Cardboard (desde 1.4.0): https://github.com/aframevr/aframe/blob/master/CHANGELOG.md
