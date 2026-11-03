# Tasks: S3 — Contrato JSON/API para integrar narraciones y libros en 2D/3D

Responsable: Carlos.
Seguimiento: S3, 26 de octubre–3 de noviembre.
Evidencia: JSON validado, prueba de consumo web/Homido y revisión de otro integrante; editor CRUD pospuesto.

## 1. Contrato Documental y Validación de Datos

- [x] 1.1 Verificar y sincronizar el contrato JSON en `content/recorridos.json` asegurando los campos completos de las tres constelaciones (`orion`, `osa-mayor`, `escorpio`), historias, libros reales de demostración y metadatos de audio local.
- [x] 1.2 Actualizar el archivo de respaldo `frontend/public/prueba-homido/data/recorridos-demo.json` para que incluya las referencias de libros y objetos multimedia idénticos al contrato canónico, eliminando los arreglos vacíos `[]`.
- [x] 1.3 Verificar la disponibilidad y reproducción de los archivos de audio locales en `frontend/public/audio/` para las tres constelaciones en los formatos admitidos (WAV/MP3).

## 2. Consumo Común y Resiliencia (Web 2D y Escena A-Frame)

- [x] 2.1 Verificar que el servicio Express `GET /api/contenidos/recorridos` sirva el contrato documental completo sin requerir credenciales de usuario ni servicios externos.
- [x] 2.2 Probar y asegurar que la interfaz web 2D (`frontend/src/services/contentService.js` y vistas `ExplorarView.vue`, `ConstelacionView.vue`) consuma correctamente los libros de demostración y controles de audio.
- [x] 2.3 Validar que el módulo `cargarDatos` de la escena A-Frame (`frontend/public/prueba-homido/js/datos.js`) consuma la API documental y active el respaldo local de forma transparente ante fallo de red o timeout.
- [x] 2.4 Verificar el orden progresivo de integración: flujo completo y comprobado de Orión primero, seguido por Osa Mayor y Escorpio.

## 3. Delimitación y Pospuesto del Panel CRUD

- [x] 3.1 Comprobar que las rutas de autenticación de administrador (`/api/admin/login`, `/api/admin/sesion`) y el middleware `verificarAdmin` permanezcan operativos sin alteraciones.
- [x] 3.2 Formalizar en la documentación y en el panel que la persistencia y edición CRUD de libros y constelaciones queda aplazada para después de la Expo, sin dependencias nuevas de base de datos.

## 4. Pruebas Automatizadas y Evidencia de Revisión

- [x] 4.1 Ejecutar suite completa de pruebas de backend (`npm test`) y frontend (`npm run test:web`) verificando contratos, fallbacks y manejo de errores.
- [x] 4.2 Documentar la verificación de rutas de error de carga, recursos locales y funcionamiento sin red institucional.
- [x] 4.3 Registrar evidencia de integración con teléfono físico en Homido y revisión cruzada por otro integrante del equipo.
