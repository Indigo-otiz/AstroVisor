# Diseño — Experimento Homido

Se utiliza una página HTML independiente en `frontend/public` para reducir la dependencia del router y permitir la prueba aislada. A-Frame 1.8.0 carga de CDN en versión fija. La escena incluye una cámara `look-controls` y una retícula de `fuseTimeout: 1800` sobre un único objetivo.

Se evitan supuestos sobre Cardboard/WebXR nativo: la vista dividida utiliza `THREE.StereoCamera` y dibuja cada ojo por separado tras el render base. La separación de ojos es orientativa, no calibrada. La salida se hace con controles HTML por encima del escenario, sin asumir que el usuario puede pulsar el teléfono mientras está dentro del visor.

El test registra eventos localmente y ofrece su copia; no persiste eventos ni envía información de sensores. El contexto seguro HTTPS es un requisito para confirmar sensores en muchos navegadores móviles. El render doble es una decisión experimental que puede requerir ajustes por dispositivo; verificar antes de declararlo compatible.

No se construye la experiencia VR final, no se incorporan libros, no se implementa cuenta ni CRUD y no se altera la base del Sprint 1 de integración.
