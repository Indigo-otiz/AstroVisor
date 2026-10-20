# Integración de la prueba Homido en AstroVisor

Copiar las carpetas **`frontend/`**, **`experiments/`** y **`openspec/`** de este paquete sobre `astrovisor-s1-inicio/`, manteniendo sus rutas internas. Esto agrega una página HTML/CSS/JS, sustituye **solo** `frontend/src/views/VisorView.vue`, agrega documentación de pruebas y crea un cambio OpenSpec independiente. **No sustituir** el proyecto, backend, ni las carpetas de otro sprint.

## Ejecución

Desde `astrovisor-s1-inicio/`:

```powershell
npm ci
npm run dev:web
```

Abrir: `http://localhost:5173/visor` y hacer clic en **Abrir prueba técnica de Homido**. O directamente: `http://localhost:5173/prueba-homido/`.

**Para pruebas en teléfono real usar una URL HTTPS:** `https://TU-DOMINIO/prueba-homido/`. Las versiones de prueba servidas por `localhost` solo sirven en la computadora anfitriona. Una conexión LAN por HTTP suele restringir eventos de sensores. La página carga A-Frame por CDN, por lo que es necesario tener Internet.

## Validación sugerida

```powershell
node --check frontend/public/prueba-homido/prueba.js
npm run build
npm test
openspec validate prueba-tecnica-homido-s1 --strict
```

La compatibilidad física con Homido y el render estereoscópico en teléfono **no se pueden declarar aprobados sin ejecutar el protocolo** y anotar resultados en `experiments/homido-spike/MATRIZ-PRUEBAS.md`.

El DOCX anexo es un **informe preliminar**, no certifica la prueba física. Utiliza formato APA 7 con tipografía negra y sin adornos.

Para integrarlo en GitHub, crea una rama `feature/s1-prueba-homido`, aplica solo estos archivos, realiza commits y abre un Pull Request para revisión de otro compañero.
