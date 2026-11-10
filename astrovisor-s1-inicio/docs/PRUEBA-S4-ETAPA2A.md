# S4 — Etapa 1 publicada y autenticación Etapa 2A

Rama: `indigo/s4-persistencia-documental`. Etapa 1 publicada como [`735fd4b1413e5cd98387e297716f3d4c76cac52d`](https://github.com/Indigo-otiz/AstroVisor/commit/735fd4b1413e5cd98387e297716f3d4c76cac52d), mensaje exacto `feat(s4): establecer catalogo documental persistente y API de lectura`. Se verificó igualdad con el hash remoto. Commit de 17 archivos explícitos de infraestructura, pruebas, documentación y OpenSpec. Base main conservada: `f1058c9b10641c470d7d3e331a81f327af78fc8c`.

El usuario revisó el informe de Etapa 2A y autorizó auditoría final, commit y push exclusivamente de autenticación si no aparecen bloqueantes. Este informe acompaña el commit de cierre; su hash se comprueba contra la rama remota después del push. No se autoriza merge, archivo OpenSpec ni Etapa 2B. No se creó PR nueva ni una cuenta real. La validación previa a publicar Etapa 1 se repitió: 38/38 backend, 93/93 web, build y OpenSpec correctos.

## Flujo implementado

1. El operador genera una cuenta explícita en un JSON privado externo mediante `npm run configurar:admin`.
2. El formulario mantiene `POST /api/admin/login` con `{usuario, contrasena}` en el cuerpo JSON. No recorta la contraseña ni pone credenciales en URL.
3. Express valida tipos/tamaños y aplica cinco intentos por IP en 15 minutos. El sexto obtiene 429 con `Retry-After`. Mapa limitado a 1000 IP, sin confiar en X-Forwarded-For.
4. Se lee `ASTROVISOR_ADMIN_FILE`; sin configuración válida se rechaza con 503, sin fallback ni cuenta demo. No hay consulta Supabase REST ni dependencia de red para identidad.
5. Scrypt asíncrono usa N=131072, r=8, p=1, sal aleatoria de 16 bytes y derivado de 64 bytes, con máximo dos verificaciones costosas simultáneas. Parámetros fijos rechazados si el archivo declara otros valores. La elección corresponde a la configuración scrypt publicada por [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt); implementación nativa y comparación de buffers según [Node 24 Crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html).
6. Usuario y derivado se comparan con `timingSafeEqual`; el usuario se resume a longitud fija, sin usar SHA-256 como hash de contraseña. Usuario desconocido también deriva la contraseña.
7. Login válido devuelve identidad pública y token aleatorio de 32 bytes (64 hex), con sesión Express en memoria de ocho horas y límite de 256 sesiones. Respuesta no contiene hashes ni huella de configuración.
8. `GET /api/admin/sesion`, logout y cualquier otra ruta administrativa comprueban token/expiración y revalidan configuración. Cambiar/retirar el archivo revoca acceso; un reinicio pierde las sesiones. POST/PATCH de contenido no implementados devuelven 404 una vez autorizado el cliente, o 401 si carece de sesión.
9. Vue consulta el servidor antes de abrir el panel; el usuario guardado no acredita permisos. El token se conserva en memoria/sessionStorage de pestaña y se retira el dato legado de localStorage. Logout limpia cliente incluso sin red y una respuesta tardía de sesión se descarta.

Rutas admin rechazan parámetros URL y envían `Cache-Control: no-store`. Login/sesión/logout no registran peticiones; una ruta administrativa desconocida puede registrar únicamente estado y marcador `<sin ruta>`. El logger usa ruta declarada, sin query/cuerpo; los errores no imprimen mensajes que puedan contener datos de entrada. Credenciales, hashes y tokens no se imprimen por el código de autenticación.

## Alta de una cuenta sin exponer contraseña

No se han proporcionado ni generado credenciales reales durante el desarrollo. Las pruebas derivan valores aleatorios y crean exclusivamente fixtures temporales eliminados al terminar.

Desde `astrovisor-s1-inicio/`, en una terminal propia interactiva:

```powershell
$env:ASTROVISOR_ADMIN_FILE = Read-Host 'Ruta absoluta del NUEVO archivo privado de cuenta, fuera del repositorio y de raíces públicas'
npm run configurar:admin
```

El comando pregunta usuario, nombre visible y contraseña dos veces, sin eco de contraseña. No suministrar contraseña por argumentos, variables de entorno, redirecciones o `echo`. El generador rechaza ejecución no interactiva/argumentos, exige 15–256 caracteres y como máximo 1024 bytes; espacios significativos no se eliminan. El archivo contiene identidad, parámetros, sal y hash; no contraseña reversible ni texto plano. Un destino existente produce error y no se sobrescribe.

Preparar permisos del directorio para la cuenta de servicio. El generador solicita modo 0700 al crear directorio y 0600 para archivo; en POSIX se rechaza un archivo con permisos de grupo/otros. **En Windows se deben configurar/verificar ACL manualmente:** los modos POSIX no las sustituyen. No usar una ruta publicada por otro servidor ni incluir este archivo en backups/exports de contenido. No cambiar `.gitignore`: los secretos permanecen físicamente fuera del checkout.

Suministrar la misma ruta `ASTROVISOR_ADMIN_FILE` al proceso Express y ejecutar `npm run dev:api` o el comando de arranque del backend. Mantener también la configuración independiente `ASTROVISOR_DATA_DIR` de Etapa 1 para contenidos. La API no genera una cuenta si falta la ruta. `.env.example` solo documenta el nombre de variable, sin valores reales.

## Migración desde el login anterior

1. Crear **una nueva contraseña** con el procedimiento local; no exportar ni reutilizar la tabla REST `admin` ni copiar contraseñas anteriores.
2. Detener/reiniciar Express con el código 2A y la ruta privada. Los tokens en memoria anteriores quedan invalidados. Vue elimina su almacenamiento legado al cargar la versión nueva.
3. Verificar login, sesión y logout con la cuenta configurada, mediante HTTPS en despliegue. La configuración Supabase ya no participa en autenticación.
4. La lectura opcional `fichas_libros` del panel sigue intacta: migrar datos/lector no es parte de 2A. Tampoco se quitaron dependencias que puedan usar esos módulos.
5. Para rotar/revocar: detener el servicio, generar un archivo nuevo en otra ruta privada y sustituir la configuración por procedimiento del operador; nunca pegar hash/contraseña en Git. Cambiar o retirar configuración también deniega sesiones existentes en la siguiente petición protegida. No hay administración de cuentas vía HTTP.

## Archivos de Etapa 2A

- `backend/src/services/adminCredentials.js`: formato/derivación/lectura/alta exclusiva de cuenta.
- `backend/src/services/privateStorage.js`: comprobación de rutas privadas extraída de Etapa 1, sin perder rechazo de rutas internas, enlaces ni unidad ausente.
- `backend/src/services/documentRepository.js`: reutiliza ese helper; conserva repositorio y proyecciones anteriores.
- `backend/src/middleware/auth.js`, `backend/src/index.js`: sesiones, límites, revocación y rutas; suprimida consulta REST y fixture de login por entorno. El arranque directo se distingue por archivo ejecutado, no por flags de prueba.
- `scripts/configurar-admin.mjs`, `package.json`, `.env.example`: comando interactivo y documentación de ruta privada.
- `backend/test/auth.test.js`, `adminCredentials.test.js`, `adminSetup.test.js`: credenciales, sesiones/HTTP, generador y regresiones.
- `frontend/src/composables/useAuth.js`, `frontend/src/router/index.js`, `frontend/src/views/AdminAccesoView.vue`: adaptación del acceso/guard sin cambiar estantería.
- `frontend/src/views/AdminPanelView.vue`: únicamente esperar logout antes de navegar; consulta bibliográfica previa intacta.
- `frontend/test/auth.test.js`: contrato de formulario, contraseña intacta, rechazo de estado local falso, logout y respuesta tardía.
- OpenSpec S4 `proposal.md`, `design.md`, `tasks.md`, `specs/gestion-documental/spec.md` y este informe.

## Pruebas realmente ejecutadas

Windows, Node v24.21.0, npm 11.0.0, Vite 6.4.4. Backend HTTP en loopback/puerto aleatorio con cuentas y documentos temporales aislados. No se usaron cuentas reales ni un servicio Supabase para verificar identidad.

| Comando | Resultado final |
|---|---|
| `npm test` | 48/48, código 0 |
| `npm run test:web` | 98/98, código 0, ejecutado por separado |
| `npm run build` | Código 0, 89 módulos |
| `openspec validate s4-persistencia-documental --strict` | Código 0 |

Cobertura: login correcto/incorrecto, sin configuración o archivo inválido, cuenta demo no habilitada por NODE_ENV/npm, token ausente/falso/expirado vía HTTP, logout e invalidación, rotación/retirada de configuración, límites de intentos, no POST de catálogo, ausencia de secretos en logs ante query/cuerpo malformado, contraseña no recortada y guard del cliente con servidor. Generador: sin eco en stream TTY simulado, cancelación/restauración raw, rechazo no interactivo/argumentos y archivo exclusivo sin sobrescribir.

La auditoría final añadió integración HTTP con contraseña aleatoria y archivo bajo `os.tmpdir()`, eliminado al terminar: login válido; JSON corrupto y hash inválido producen 503 al intentar login; comprobar sesión con archivo corrupto produce 503 e invalida token, solicitudes posteriores reciben 401. Restaurar configuración permite un login nuevo pero no reactiva el token invalidado. Las pruebas existentes verifican sesión/logout, expiración mediante reloj controlado, rotación y ausencia de archivo. No se creó cuenta de ejecución normal.

La prueba HTTP de rate limit verifica `app.get('trust proxy') === false`. Cambia `X-Forwarded-For`, `X-Real-IP` y `Forwarded` entre intentos; el sexto sigue recibiendo 429. No se modifica esa opción desde variables de entorno. No se ha probado un proxy desplegado; mantener backend inaccesible directamente si se configura uno posteriormente y revisar topología/IP antes de cambiar trust proxy.

El primer `npm test` de esta auditoría no pudo iniciar los seis procesos de prueba por `spawn EPERM` del sandbox; no ejecutó sus aserciones. Se repitió fuera de ese sandbox y pasó 48/48. Web, build y OpenSpec se ejecutaron por separado; no se ocultó el error de infraestructura.

Los tests nuevos fallaron antes de sus implementaciones. La revisión independiente no identificó hallazgos críticos/importantes reproducibles; señaló una prueba de ruta privada que pasaba un URL en lugar de una ruta, y se corrigió la cobertura. Se añadió prueba que observó la respuesta de sesión tardía tras logout antes de corregirla.

**Incidencia conservada e investigada:** una ejecución paralela anterior de backend (scrypt), web y build produjo 97/98 en web: `gazeController.test.js` no observó la etapa 33 %. La misma suite, ejecutada sola, pasó 98/98 y la repetición completa de esta auditoría pasó 98/98. Además se ejecutó diez veces el archivo de mirada sin carga concurrente: 10/10 ejecuciones, cinco pruebas cada una, correctas. El test usa tiempo real (dwell 100 ms, espera 150 ms), y el controlador calcula la etapa actual en muestras cada 16 ms, sin emitir retrospectivamente etapas intermedias.

Un diagnóstico por stdin, sin crear/modificar archivos, inició el controlador con dwell 100 ms y bloqueó deliberadamente el bucle de eventos durante 80,0645 ms: observó `0% → 66% → 100%`, con confirmación correcta y sin etapa 33 %. Esto reproduce el salto bajo retraso controlado. [Inferencia] La diferencia entre resultados previos respalda tratar la aserción como sensible a temporización/carga; el experimento no prueba la causa concreta del fallo paralelo original. No se alteraron controlador ni test de mirada. Ejecutar validaciones por separado y revisar determinismo en una tarea de mirada independiente.

## Resultado de la auditoría final

No se identificaron problemas bloqueantes en el código revisado y las pruebas locales ejecutadas. Esto no sustituye una auditoría del despliegue.

| Comprobación | Evidencia local |
|---|---|
| Sin consulta de contraseñas a Supabase | `backend/src/index.js` llama solo a `verificarCredenciales`; búsqueda en fuentes sin `rest/v1/admin` ni fixture `admin123` |
| Sin demo automática | No hay bifurcaciones por NODE_ENV/npm en fuentes de auth; pruebas cambian esas variables y reciben rechazo sin configuración |
| Configuración ausente/corrupta/inválida | Lectura estricta y pruebas unitarias/HTTP con 503, sin fallback |
| Hash/sal y comparación | `scrypt` nativo, parámetros fijos, buffers de longitud validada y `timingSafeEqual`; pruebas de contraseña correcta/incorrecta y espacios |
| IP y rate limit | trust proxy desactivado comprobado; cabeceras falsificadas no evaden límite; dos derivaciones concurrentes como máximo |
| Sesión y autorización servidor | Token opaco, ocho horas, logout, expiración y huella revalidada; middleware en sesión/logout y resto de `/api/admin` |
| URLs y logs | Cliente envía JSON/bearer; servidor rechaza queries admin; capturas de logs sin contraseña/hash/token incluso con entrada malformada |
| Inicialización privada | Ruta absoluta externa al checkout, verificación de enlaces; creación exclusiva; segundo intento conserva bytes del archivo |
| Historial y publicación | Generador rechaza argumentos/redirección; entrada oculta simulada; contraseña no se pasa a la shell. No se creó configuración real |

No se cambiaron reglas de `.gitignore`. La revisión del índice antes del commit incluye solo archivos explícitos de código, pruebas, `.env.example` sin valores y documentación. Runtime, configuración privada y temporales no forman parte de la selección.

## Límites pendientes

- No se ha probado TTY física, navegador, móvil, teclado ni Homido físico; las pruebas de stream y mocks no equivalen a esos entornos.
- Verificar HTTPS, ACL y calibración de memoria/costo en el servidor destino. No se declara despliegue seguro verificado solo por pasar tests locales.
- Rate limit/sesiones residen en una instancia y se pierden al reiniciar. Tras proxy todos los clientes pueden compartir IP; no activar trust proxy indiscriminadamente. No se implementa mitigación distribuida de ataques.
- SessionStorage es accesible a JavaScript; conserva riesgo ante XSS. No hay cookies HttpOnly en este alcance. Cerrar pestaña/limpiar cliente no garantiza revocación remota si logout no llega: el token conserva expiración o debe revocarse mediante configuración/reinicio.
- Una sola cuenta administrativa explícita, sin usuarios automáticos, recuperación por correo, MFA o gestión de cuentas web.
- Pendientes CRUD, migración del lector estático, generación de portadas, sincronización Homido y footer. SVG y diseño de estantería permanecen sin modificación.

Se conservaron `.gitignore` preexistente, presentaciones/guion, `.presentacion-build/` e informe mixto local `docs/VALIDACION-PR6-S4.md`; se registraron sus hashes para comprobar que permanecen intactos durante esta auditoría/publicación. OpenSpec 1.1–1.4b registra implementación y revisión/autorización del usuario; 1.4c mantiene pendientes operativos. No se inicia Etapa 2B ni se declara S4 completo.
