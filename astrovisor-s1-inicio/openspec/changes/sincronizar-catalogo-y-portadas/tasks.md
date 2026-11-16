# Tasks

## 1. Libros

- [x] 1.1 Instalar los 15 JPEG recortados por ID y comprobar que Vite incluye los archivos en el build.
- [x] 1.2 Ajustar el importador y documentar el procedimiento para un catálogo existente. Verificar que conserva las ediciones, añade las relaciones faltantes y al repetir la operación conserva la revisión.
- [x] 1.3 Completar los autores pendientes del lote en catálogos ya importados. Probar que se conservan los autores editados, que se puede publicar el respaldo actualizado y que repetir la importación mantiene la revisión.

## 2. Verificación

- [x] 2.1 Comprobar que el exportador genera otra revisión para las portadas recortadas de libros ya importados, con los JPEG correctos y con el paquete anterior intacto.
- [x] 2.2 Ejecutar pruebas de web y API, compilar y verificar el contenido servido por la aplicación.

## Resultados

- Compilación de producción correcta. Los 15 JPEG de `dist` coinciden con los de `public`.
- API 134/134 y web 176/176 en Windows con `TEMP` y `TMP` configurados con su ruta larga.
- Prueba HTTP con un catálogo aislado. La API devolvió los 15 libros, el sitio sirvió los 15 JPEG y el lector de Homido recuperó el lote desde un respaldo verificado tras un fallo simulado de la API.
- La actualización se probó sobre catálogos temporales. La instalación de destino requiere su propio `ASTROVISOR_DATA_DIR`.
- Con el lote y el respaldo ya publicados, la prueba completó cinco autores, conservó el autor editado y verificó los créditos en el paquete nuevo. Una segunda importación mantuvo la revisión.
