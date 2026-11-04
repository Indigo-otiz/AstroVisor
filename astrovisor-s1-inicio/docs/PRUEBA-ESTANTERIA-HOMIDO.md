# Estantería y consulta de libros en el Homido (prototipo)

## Flujo
1. Abre Orión, Osa Mayor o Escorpio desde la escena 3D.
2. En la ficha mira «Ver libros recomendados» durante 3 segundos, o selecciónalo por toque.
3. En la estantería frontal se presentan hasta 3 cubiertas ilustrativas (una por constelación), con la elegida destacada al centro. Enfoca un libro durante 3 segundos.
4. Consulta su ficha breve: título, autor, invitación a leer y aclaración de que no existe ubicación física confirmada.
5. «Consultar información en 2D» cierra la ficha, detiene la narración y dirige a la ruta web 2D correspondiente a la rama.
6. Los botones «Volver a los libros» y «Volver a la constelación» regresan sin salir del visor. Pausar mirada y Salir a 2D permanecen disponibles.

## Datos y atribución
Se reutiliza exclusivamente el arreglo `libros[]` de los recorridos servidos por la API o su respaldo demostrativo. Las cubiertas se dibujan en canvas por AstroVisor: **no son imágenes de libros originales**. No se inventan existencias, identificadores MARC 21, signaturas ni ubicaciones de la biblioteca.

## Revisión pendiente
- Ejecutar desde `frontend/`: `npm test` y `npm run build`.
- Validar el cambio OpenSpec de la rama con `openspec validate <cambio> --strict`.
- Probar en escritorio las tres constelaciones, selección de portadas por clic y por mirada, ambas rutas de regreso, pausa, salida y navegación a la web 2D.
- Probar físicamente en Safari/iPhone y Android dentro del Homido: legibilidad, comodidad visual, orientación, selección de 3 segundos, audio y salida.
- Revisar posteriormente los wireframes de Figma; no forman parte de este incremento.

**Estado:** implementación en borrador. Ninguna de estas pruebas ha sido ejecutada aquí; no se afirma compatibilidad física.
