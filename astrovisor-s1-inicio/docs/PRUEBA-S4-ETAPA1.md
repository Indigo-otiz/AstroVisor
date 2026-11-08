# S4 — Etapa 1: catálogo, inicialización y lectura

Rama: `indigo/s4-persistencia-documental`. Base comprobada: `f1058c9b10641c470d7d3e331a81f327af78fc8c`, también HEAD/main al iniciar. Cambios locales para revisión, sin commit, push, merge ni archivo OpenSpec.

## Implementado

Archivos nuevos de esta etapa: `backend/src/services/catalogo.js`, `backend/test/catalogo.test.js`, `backend/test/catalogo-api.test.js`, `content/catalogo-inicial.json`, `scripts/inicializar-catalogo.mjs` y este informe. Archivos existentes modificados: `backend/src/services/documentRepository.js`, `backend/src/index.js`, `backend/test/documentRepository.test.js`, `package.json`, `.env.example`, `content/README.md` y los cuatro artefactos Markdown de OpenSpec S4. El `.gitignore` que aparece modificado en status es preexistente y no forma parte de esta implementación.

- `content/catalogo-inicial.json`: semilla versionada con tres libros únicos, tres constelaciones, nueve relaciones con motivo y recursos de audio completos.
- `backend/src/services/catalogo.js`: migración de los fixtures de #6, validación y proyecciones. Conserva metadatos desconocidos internamente y rechaza discrepancias en vez de resolverlas por suposición.
- `documentRepository.js`: lectura de `<ASTROVISOR_DATA_DIR>/catalogo.json`; directorio privado absoluto fuera del checkout. Comprueba rutas reales, incluida redirección por enlace de directorio. No lee fixtures antiguos ni inicializa al recibir una petición.
- `scripts/inicializar-catalogo.mjs` / `npm run init:catalogo`: creación explícita desde semilla, sin sobrescribir destino existente. Escribe/sincroniza/cierra temporal y publica mediante hard link exclusivo; compitiendo dos inicializadores solo uno tiene éxito.
- `GET /api/contenidos/recorridos`: mismo arreglo y selección bibliográfica que #6, sin retirar campos ni cambiar datos astronómicos.
- `GET /api/contenidos/libros`: lectura del catálogo completo; filtro opcional `constelacionId` con respuestas 400/404 para parámetros inválidos/inexistentes. No hay endpoint de escritura nuevo.

La relación conserva `libroId`, `motivo` y, solo cuando existía en el contrato Homido previo, `referencia` con los metadatos bibliográficos adicionales. Título/autor/año/URL provienen del libro único, sin duplicarlos en cada constelación. Los audios, sus transcripciones y créditos permanecen en `multimedia`.

## Configuración antes de usar la API

No se eligió ni creó un directorio privado real del usuario. La API de contenido requiere configuración e inicialización explícita. Sin ellas devuelve un error controlado; no crea datos automáticamente ni usa semilla como fallback silencioso.

Ejemplo interactivo en PowerShell, desde `astrovisor-s1-inicio/`:

```powershell
$env:ASTROVISOR_DATA_DIR = Read-Host 'Directorio absoluto privado fuera del repositorio y de las raíces públicas'
npm run init:catalogo
npm run dev:api
```

El mismo valor debe suministrarse al proceso Express en cada arranque. El script inicializador toma la variable del entorno; no modifica `.env` real. Repetir inicialización termina con código 1/EEXIST y conserva los bytes anteriores. No apuntar la variable al checkout, `frontend/public`, `dist` o una ubicación servida por otro servidor. En Windows configurar ACL del directorio para la cuenta de servicio; los modos POSIX solicitados no sustituyen ACL. Verificar hard links y volumen persistente en el destino de despliegue.

## Migración y respaldo todavía pendientes

La estantería mantiene su import estático de `libros-demo.json`: no se alteraron componentes, estilos o rutas. El nuevo GET prepara su migración; no se declara actualización dinámica de esa pantalla desde runtime terminada. Los JSON antiguos quedan como fixtures/entrada histórica con pruebas de igualdad inicial; no deben convertirse en fuentes con doble escritura.

El respaldo Homido permanece intacto y coincide con la proyección de la semilla inicial. No hay sincronización automática del respaldo ante futuras ediciones. API principal y respaldo estático versionado siguen siendo el comportamiento existente; alojamiento independiente pospuesto por el usuario. No se introduce promesa nueva de uso offline.

## Verificación real

Windows, PowerShell, Node `v24.21.0`, npm `11.0.0`, Vite `6.4.4`. Pruebas de persistencia en carpetas temporales aisladas bajo el directorio temporal del sistema; eliminadas por los tests. HTTP probado contra Express en loopback y puerto aleatorio, con fixture privado temporal y sin credenciales de producción.

| Comando | Resultado |
|---|---|
| `npm test` | 38/38, código 0 |
| `npm run test:web` | 93/93, código 0 |
| `npm run build` | Correcto, código 0; 89 módulos |
| `openspec validate s4-persistencia-documental --strict` | Correcto, código 0 |

Pruebas específicas: semilla frente a migración; IDs y nueve relaciones; conservación de metadatos desconocidos y recursos; contrato recorrido idéntico al anterior; SHA-256 de tres SVG; lectura HTTP completa/filtrada y errores; archivo existente válido/corrupto no sobrescrito; lectura desde otro proceso tras modificar un fixture; JSON inválido sin reinicio; inicialización concurrente; CLI real y repetición; rutas relativas/dentro del checkout/enlaces hacia él; unidad Windows ausente; recursos/portadas ausentes y claves peligrosas.

Se observó fallo antes de implementar el módulo, fallo de endpoints antes de agregarlos y fallo de ID ausente antes de corregir su validación. La revisión independiente detectó ascenso indefinido en una unidad Windows inexistente: nueva prueba reprodujo timeout, se añadió detección de raíz y después pasó en la suite completa. El mensaje `Error API: ... JSON ...` durante la suite es el caso intencional de corrupción con respuesta 500 comprobada; no un test fallido.

## OpenSpec y preservación

Completadas tareas 2.1, 2.2a, 2.3 y 2.4. Registradas decisiones ya aprobadas en 0.1/0.3/0.5. El resto del MVP y sus pruebas no se marcan completos. Se conservaron los documentos S4 preexistentes, actualizando alcance vigente y casillas sin borrar el diseño anterior; `.openspec.yaml` no se archivó ni reemplazó.

Intactos: cambio preexistente de `.gitignore`, `.presentacion-build/`, presentaciones/guion de la raíz, `docs/VALIDACION-PR6-S4.md`, auth/Supabase, frontend, SVG y respaldo Homido. No se usó `git add .`, `git add -A`, `reset --hard` ni `clean`.

## Límites y siguiente autorización

No hay formularios CRUD, escrituras administrativas, cambios de autenticación, generación de portadas, footer, backups de ediciones ni recuperación administrativa implementados. La autenticación local con hashes/sesiones Express queda decidida, pero su código y pruebas corresponden a la siguiente autorización. Validación del volumen/ACL de producción y migración de lectores siguen pendientes.

No se realizaron pruebas en navegador, móvil/360 px, teclado, escucha real ni Homido físico durante esta etapa; las pruebas automatizadas de simulación no sustituyen esas comprobaciones. Detenerse para revisión de esta entrega antes de implementar otra etapa.
