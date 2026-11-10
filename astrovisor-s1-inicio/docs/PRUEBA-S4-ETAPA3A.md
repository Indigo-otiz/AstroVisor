# Sprint 4 — Etapa 3A: panel y estantería documental

Auditoría final y publicación de Etapa 3A autorizadas por el usuario, incluida corrección acotada de borradores ante expiración. Rama `indigo/s4-persistencia-documental`, base publicada `38c00eb452e3f24b4bbb2177ce58ce8463d7ace1`. Commit de entrega con mensaje `feat(s4): conectar panel administrativo y biblioteca al catalogo`. Sin merge ni archivo OpenSpec. No se inicia 3B. El hash publicado se informa después de verificar push.

## Alcance y funcionamiento

El panel conserva navegación, cabecera, selector de experiencias y estructura anterior. Sustituye la consulta Supabase de `fichas_libros` por `GET /api/admin/catalogo`. No se borran datos remotos ni se modifica el backend. La corrección final modifica únicamente la retirada y almacenamiento del token en Vue; conserva el contrato de autenticación Express.

Seleccionar una ficha permite editar año, enlace HTTPS y motivos de las relaciones existentes. Seleccionar una constelación permite editar resumen y cómo reconocerla. Título y autor son de solo lectura: los SVG contienen textos estáticos y Homido mantiene un mapa por título. La interfaz explica esa dependencia. No hay creación, eliminación ni subida de archivos.

El GET proporciona ETag, enviado exactamente en If-Match. La confirmación requiere PATCH exitoso con revisión coherente; después se consulta el catálogo. Un 412 conserva el borrador y bloquea reenvío hasta recarga explícita. Los mensajes cubren 400/401/403/404/409/412/428/503 y fallos de red/respuesta. Cancelar una edición normal no envía PATCH. El guardado informa siempre que el respaldo estático Homido está pendiente.

Si PATCH confirma pero falla el GET posterior, se conservan confirmación, revisión recibida y borrador. El catálogo anterior queda bloqueado para editar incluso después de cancelar: solo un GET exitoso habilita nuevas selecciones. Si se pierde la respuesta del PATCH, el cliente no afirma éxito y pide consultar antes de reintentar; el If-Match anterior permanece sujeto a rechazo por el servidor.

Un 401 detiene operaciones, retira el token en memoria y usa el acceso existente sin reenviar el token inválido a logout. Antes de redirigir se conserva exclusivamente el borrador no confirmado, selección, identidad y ETag en memoria del módulo de esta pestaña. El acceso avisa que no se recargue ni cierre la pestaña. Tras volver a autenticarse con la misma identidad y consultar el catálogo, «Recuperar borrador» devuelve los campos sin enviar PATCH. Si cambió la revisión, se muestra conflicto y se bloquea guardado; copiar el texto antes de descartar/recargar permite reconciliar manualmente. Otra identidad no recibe el borrador; cerrar sesión explícitamente lo descarta. Si el guardado ya fue confirmado, no se ofrece como edición pendiente de envío.

No se escriben borradores, contraseñas ni tokens en localStorage/sessionStorage/IndexedDB. Se retira el antiguo almacenamiento del token en sessionStorage y se limpian las claves heredadas; token nuevo solo en memoria. Recargar o cerrar la pestaña pierde borrador y sesión cliente y exige nuevo login. No se agregan tokens a URLs ni registros del cliente. Esto sustituye el comportamiento anterior documentado en 2A de restaurar sesión desde sessionStorage; no altera hashes ni sesiones del servidor.

La estantería consulta `GET /api/contenidos/libros` en cada carga. Usa IDs para rutas y fichas, cancela solicitudes anteriores y descarta respuestas tardías. Distingue carga, error con reintento, catálogo vacío y libro no encontrado. No usa JSON compilado como respaldo silencioso. `libros-demo.json` queda como fixture de pruebas; no se añade una segunda fuente de escritura.

## Inventario

- Modificados: `frontend/src/views/AdminPanelView.vue`, `frontend/src/views/AdminAccesoView.vue`, `frontend/src/views/BibliotecaView.vue`, `frontend/src/services/librosDemoService.js`, `frontend/src/composables/useAuth.js`, `frontend/test/biblioteca-demo.test.js`, `frontend/test/auth.test.js`.
- Nuevos: `frontend/src/services/catalogoAdminService.js`, `frontend/src/composables/useEditorCatalogo.js`, `frontend/src/composables/useLibros.js`.
- Nuevas pruebas: `frontend/test/catalogo-editor.test.js`, `frontend/test/libros-api.test.js`, `frontend/test/catalogo-integracion.test.js`.
- Documentación: este informe, siete capturas en `docs/evidencias-s4-3a/` y proposal/design/spec/tasks de `openspec/changes/s4-persistencia-documental/`.

Sin cambios funcionales en backend, SVG, Homido, audio, transcripciones, metadatos o estilos globales. El CSS original de BibliotecaView se conserva; el panel añade estilos acotados del editor y flex-wrap a su barra a menos de 640 px.

## Pruebas automatizadas

Windows, PowerShell y Node v24.21.0; datos y configuración administrativa generados exclusivamente en directorios temporales externos. No se crean cuentas institucionales ni se modifica el catálogo real.

| Comprobación | Resultado final |
|---|---|
| `npm test` | 87/87 |
| `npm run test:web` | 115/115 |
| `npm run build` | Correcto |
| `openspec validate s4-persistencia-documental --strict` | Correcto |
| Integración HTTP de servicios/composable con Express real | 1/1; incluida en web |
| Regresión cancelar tras guardado confirmado y recarga fallida | Correcta; incluida en web |

La integración HTTP comprueba tres portadas, rechazo 401 sin sesión y revisión intacta, login temporal, PATCH autorizado, lectura pública actualizada, conflicto 412 con borrador conservado y nueve relaciones/multimedia intactos. Detiene servidor y escritor; inicia otro proceso Node y consulta los datos persistidos. El token anterior es rechazado tras reiniciar; nuevo login permite leer el catálogo exacto persistido.

Los tests unitarios cubren cancelación sin PATCH, carga y estados, If-Match exacto, confirmación posterior a respuesta, errores HTTP, recarga fallida tras guardar, bloqueo tras cancelar, ETag inválido, ausencia de token, cambios de constelación y respuestas fuera de orden. Se ejecutaron también las pruebas anteriores de mirada, audio y Homido; no se modificaron sus módulos.

Fallos reales durante desarrollo:

- Antes de migrar el servicio, nuevas pruebas detectaron ausencia de fetch y de rechazo/estado vacío; antes de crear módulos falló su importación.
- La extracción inicial de revisión incluyó el guion del ETag y fallaron dos casos de guardado; se corrigió y pasaron las pruebas específicas.
- La revisión independiente reprodujo pérdida de un valor confirmado al cancelar después de GET fallido y reseleccionar usando catálogo viejo con ETag nuevo. Nueva regresión falló 7/8 antes de corregir y pasó 8/8 después. La recarga requerida ahora pertenece al estado del catálogo, no al borrador.
- Una ejecución de Node bajo sandbox falló con `spawn EPERM`; se repitió con permiso y ejecutó la regresión real. No es un fallo de la aplicación.
- Auditoría final: regresiones iniciales detectaron token escrito en sessionStorage, invalidación local ausente y exportación de recuperación todavía inexistente. Tras implementación, pruebas específicas 17/17 y suite web 115/115. Cobertura nueva: 401 y token nuevo, revisión igual/cambiada, identidad distinta y ausencia de reutilización/almacenamiento del token. No se modificaron pruebas de Homido o mirada.

## Navegador y evidencia visual

Chrome headless **156.0.8078.80**, Playwright ya instalado, perfil aislado, Vite y Express temporales con credenciales aleatorias externas. El host de control del navegador de la sesión no estaba disponible; esta comprobación se realizó en una instancia aislada. No se usaron sesiones o datos reales.

- Escritorio 1280×900: estantería con tres SVG cargados y ruta individual por ID; login, edición y lectura pública del año cambiado sin reiniciar Vite. Conflicto real creado por una segunda escritura HTTP: texto conservado y guardado deshabilitado.
- 360×900 emulado: estantería, ficha y panel. La primera ronda detectó ancho 577 px en la barra preexistente del panel; ajuste local de flex-wrap y confirmación posterior: ancho total 360 px. Ficha: 360 px sin desbordamiento.
- Teclado: Enter abre editor; Tab llega a título de solo lectura; Shift+Tab vuelve a recarga (botones de selección deshabilitados durante edición). Cancelar devuelve foco al botón de selección original. Esta prueba no constituye auditoría exhaustiva con lector de pantalla.
- CSS `zoom: 2` sobre viewport 1280×900: panel legible y ancho total 1280 px. **Es emulación CSS de 200 %, no zoom nativo del navegador.**
- Interrupción de GET público desde navegador: mensaje/reintento, cero tarjetas antiguas; cero errores JavaScript no controlados en la ronda funcional.
- Ronda final repetida: cancelación sin PATCH; sesión revocada en Express mientras el formulario contiene año 1920; 401 redirige con aviso y cero peticiones logout desde Vue. localStorage/sessionStorage sin token. Nuevo login, GET y recuperación explícita conservan 1920 con cero PATCH adicionales hasta pulsar guardar. Guardado y lectura pública del cambio sin reiniciar Vite. Repetidos 412, error de API, tres SVG, ruta por ID, teclado, 360 px y CSS 200 %; cero errores JavaScript no controlados.

Las primeras aserciones de teclado asumieron que Shift+Tab enfocaría el encabezado con tabindex -1 o un botón deshabilitado; se corrigió la expectativa al orden nativo real. El primer intento del script aislado usó una ruta de dependencia inexistente; se utilizó la instalación de la raíz. El script temporal y sus datos se retiraron después de comprobar resultados; las capturas se conservan sin credenciales.

Capturas: [estantería escritorio](evidencias-s4-3a/estanteria-escritorio.png), [estantería 360](evidencias-s4-3a/estanteria-360.png), [ficha 360](evidencias-s4-3a/ficha-360.png), [conflicto en panel](evidencias-s4-3a/panel-conflicto-escritorio.png), [panel 360](evidencias-s4-3a/panel-360.png), [panel CSS 200 %](evidencias-s4-3a/panel-zoom-css-200.png). Se inspeccionaron capturas renderizadas.

Evidencia adicional: [borrador recuperado tras nuevo login](evidencias-s4-3a/panel-borrador-recuperado.png), inspeccionada después de la ronda final. Las siete capturas corresponden a datos temporales de prueba; no contienen cuentas institucionales, contraseñas ni tokens.

Detector Impeccable ejecutado: un aviso de borde inferior en tarjeta redondeada de la estantería. Corresponde al CSS aprobado de PR #6, conservado por instrucción del usuario; no se rediseña.

La revisión final independiente confirmó la corrección del catálogo desactualizado con 8/8 pruebas del editor y no identificó otros bloqueantes reproducibles en los servicios/composables/vistas revisados. No equivale a una auditoría del despliegue.

## OpenSpec y pendientes

5.1a (pruebas de edición/lectura), 5.2 y 5.3 implementadas; 5.1b (alta con relación) pendiente hasta 5.4. 5.5a registra solo navegador aislado/emulación efectivamente ejecutados; 5.5 completa sigue pendiente por zoom nativo y validación operativa. Secciones 6 y 3.5 no se cierran: falta sincronización Homido y copia externa operativa. S4 no se declara terminado.

Permanecen pendientes zoom nativo 200 %, teléfono y Homido físicos, sensores/audio en dispositivo y revisión accesible exhaustiva; despliegue institucional, ACL/HTTPS y copia externa/restauración operativa. El respaldo Homido sigue estático; cambios administrativos no se exportan automáticamente. No se habilita edición de título/autor ni altas del panel hasta resolver sus dependencias. Sesiones siguen en memoria y se invalidan al reiniciar Express.

## Archivos ajenos conservados

Sin editar `.gitignore` (cambio local previo), `docs/VALIDACION-PR6-S4.md`, la carpeta raíz `.presentacion-build/`, el guion y los PDF/PPTX preexistentes de presentaciones. Se verificó el inventario de 2281 archivos mediante SHA-256 agregado: `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`. Se excluyen de publicación. `main` y `origin/main` locales siguen en `f1058c9b10641c470d7d3e331a81f327af78fc8c`.

`git diff --check` general señala únicamente la línea vacía final preexistente de `.gitignore`; se conserva. La comprobación acotada a frontend/OpenSpec no señala errores de espacios. Consulta remota previa a publicación confirmó rama S4 en `38c00eb452e3f24b4bbb2177ce58ce8463d7ace1` y main en `f1058c9b10641c470d7d3e331a81f327af78fc8c`.
