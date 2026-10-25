# Contenidos provisionales
Los archivos JSON se utilizan únicamente para probar la separación entre contenido y presentación.
No son el guion oficial ni el catálogo definitivo de la biblioteca.
No cargar aquí datos de personas, contraseñas, reservas ni préstamos.
El MVP trabajará con recorridos de constelaciones, sujetos a validación de la biblioteca.

## Contrato público S2

`GET /api/contenidos/recorridos` devuelve el arreglo completo de `recorridos.json`. Cada registro conserva `id`, `titulo`, `resumen`, `demostracion`, `libros` y `multimedia`, y añade `historia` y `comoReconocerla` (textos no vacíos). Los IDs deben ser únicos y estables: forman las direcciones `/explorar/orion`, `/explorar/osa-mayor` y `/explorar/escorpio`.

`historia` es una adaptación narrativa de demostración; `comoReconocerla` describe la silueta. Ninguno contiene HTML. Las vistas imprimen estos campos como texto y no los ejecutan. `demostracion` permanece en `true` hasta recibir y revisar contenido autorizado; la interfaz S2 todavía se presenta como demostrativa. Los arrays vacíos no acreditan libros ni audios disponibles.

Para sustituir los textos, editar este documento JSON conservando los campos y ejecutar `npm test`, `npm run test:web` y `npm run build` desde la raíz del proyecto Vue. Consultar nuevamente la API: el adaptador lee el archivo en cada petición. La autorización de nuevos materiales y su procedencia deben documentarse antes de presentarlos como contenido institucional.
