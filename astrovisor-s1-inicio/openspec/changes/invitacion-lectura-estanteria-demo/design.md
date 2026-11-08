# Diseño técnico: Biblioteca de las estrellas

1. **Puerta de entrada:** `/explorar/:id` conserva historia y narración; reemplaza el bloque de referencia bibliográfica por una invitación con `RouterLink` hacia `/explorar/:id/libros`. La CTA dice qué pasará al seleccionarla.
2. **Estantería:** página `BibliotecaView.vue` muestra 3 libros de frente en una rejilla de apariencia cálida, con portadas SVG de autoría de demostración y títulos debajo; sin lomos difíciles de leer ni elementos animados.
3. **Detalle:** ruta `/explorar/:id/libros/:libroId` presenta razón de lectura, datos bibliográficos y enlace externo identificado como obra en línea; navegación atrás a la estantería y a la constelación.
4. **Datos:** `src/data/libros-demo.json` es el catálogo separado; `src/services/librosDemoService.js` mapea constelación y libro y valida que ningún identificador se venda como real. Se reutilizan títulos, autores, años y enlaces del documento compartido; no se escribe en él.
5. **MARC 21:** `campo001` y `campo003` contienen valores con prefijo `DEMO` explícitos; `signatura852` y `ubicacion852` se dejan nulos. En pantalla: «identificador simulado» y «consulta al personal para datos reales», jamás una ubicación inventada.
6. **Accesibilidad:** sin modal, pantalla autónoma; portadas con alt que aclara que son ilustraciones; acciones textuales >= 48 px, foco visible, diseño adaptable 1/2/3 columnas, título del documento sincronizado y navegación semántica. Mantener jerarquía y estilos actuales hasta revisar Figma.
7. **Compatibilidad:** `public/prueba-homido/` se amplía para navegación de libros, sus zonas activas y estados de subvista. Conservar funciones previas del controlador de mirada de 3 s, renderizado estéreo y audio/eventos de narración. No cambiar `audio/`, backend, Supabase ni datos astronómicos por esta extensión.

## Riesgos
- Un visitante puede creer que la biblioteca posee el libro -> aviso claro en listado y detalle; no usar la expresión «Disponible».
- Una cubierta dibujada puede confundirse con la real -> marcar «Portada ilustrativa» y texto alternativo descriptivo.
- Interfaz no evaluada con adultos mayores reales -> registrar pruebas de escritorio y reservar evaluación humana.
- La API puede fallar -> el catálogo de ejemplo es independiente; no muestra disponibilidad real.

## Verificación
Tests de catálogo, rutas y enlaces; `npm test` y `npm run build` cuando el entorno lo permita. Inspección manual de teclado y vistas estrechas pendiente de dispositivo.


## Extensión de libros en Homido
La ficha de constelación añade una invitación y una zona de mirada sobre «Ver libros recomendados». La estantería 3D utiliza portadas ilustradas en canvas aplicadas a planos A-Frame delante de una repisa sencilla, con el mismo controlador de selección por mirada de 3 s. Una ficha breve permite regresar o abrir la pantalla 2D. El modo de estado principal permanece en `ficha`; una subvista distingue `ficha`, `estanteria` y `detalle`. El reproductor de Luis y el renderer estéreo no se modifican. La navegación se adapta a las rutas propias de cada PR.
