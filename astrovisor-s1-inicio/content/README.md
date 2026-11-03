# Contenidos provisionales
Los archivos JSON se utilizan únicamente para probar la separación entre contenido y presentación.
No son el guion oficial ni el catálogo definitivo de la biblioteca.
No cargar aquí datos de personas, contraseñas, reservas ni préstamos.
El MVP trabajará con recorridos de constelaciones, sujetos a validación de la biblioteca.

## Contrato público S2

`GET /api/contenidos/recorridos` devuelve el arreglo completo de `recorridos.json`. Cada registro conserva `id`, `titulo`, `resumen`, `demostracion`, `libros` y `multimedia`, y añade `historia` y `comoReconocerla` (textos no vacíos). Los IDs deben ser únicos y estables: forman las direcciones `/explorar/orion`, `/explorar/osa-mayor` y `/explorar/escorpio`.

`historia` es una adaptación narrativa de demostración; `comoReconocerla` describe la silueta. Ninguno contiene HTML. Las vistas imprimen estos campos como texto y no los ejecutan. `demostracion` permanece en `true` hasta recibir y revisar contenido autorizado; la interfaz S2 todavía se presenta como demostrativa. Los arrays vacíos no acreditan libros ni audios disponibles.

Para sustituir los textos, editar este documento JSON conservando los campos y ejecutar `npm test`, `npm run test:web` y `npm run build` desde la raíz del proyecto Vue. Consultar nuevamente la API: el adaptador lee el archivo en cada petición. La autorización de nuevos materiales y su procedencia deben documentarse antes de presentarlos como contenido institucional.

## Narraciones S3

Los tres relatos actuales tienen archivos WAV locales con voz sintética femenina **Kokoro ef_dora**, elegida por Luis como «Femenina, cálida y tranquila» después de solicitar reemplazar la voz robótica anterior. La fonética usa español latinoamericano. Luis confirmó que los guiones fueron elaborados por el equipo AstroVisor y solicitó registrar esa autoría colectiva. `estadoDerechos` es `declarado-por-equipo`, con uso en la demostración indicado por el responsable. La fuente y el alcance constan en [AUTORIA.md](AUTORIA.md); no se asigna una licencia pública al texto ni aprobación institucional de la biblioteca.

Cada entrada `multimedia` de tipo `audio` contiene `src` (ruta local activa `/audio/<id>-kokoro-v1.wav`), `formato`, `transcripcion` (texto exacto entregado al sintetizador), `autorTexto`, `procedencia`, `voz`, `permisoTexto`, `permiso`, `estadoDerechos`, `licenciaVozFuente` y `demostracion`. Las transcripciones descargables están junto a los audios como `<id>.txt`. La ficha muestra los créditos como texto. Si un recurso falta o sus metadatos básicos son inválidos, la narración no se habilita y la historia sigue legible. Las rutas versionadas evitan reutilizar el archivo Piper que algún navegador pudiera tener en caché.

El modelo [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) está publicado con licencia Apache-2.0; [ef_dora](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md) es un identificador de voz sintética, no la atribución a una narradora del equipo. El runtime [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) es MIT. La licencia del modelo no resuelve derechos del guion. Modelo y dependencias se mantienen fuera del producto en una carpeta temporal. El navegador reproduce WAV; no usa síntesis en vivo ni envía relatos a un proveedor TTS.

Para reproducir la generación actual, preparar una carpeta `RUTA/kokoro` con `kokoro-v1.0.onnx`, `voices-v1.0.bin` desde la publicación `model-files-v1.1` del runtime, y dependencias en `deps/` (`python -m pip install --target RUTA/kokoro/deps kokoro-onnx==0.4.9 soundfile`). Ejecutar con Python 3.12:

```powershell
python -X utf8 scripts/generar-narraciones-kokoro.py --motor 'RUTA/kokoro'
node scripts/registrar-audios.mjs --kokoro
```

La voz usa velocidad 0.96, ajuste de volumen con margen de pico y fundidos de 12 ms, sin música ni reverberación. La salida es WAV PCM16, mono, 24 kHz, sin saturación digital detectada. El registro conserva autoría, procedencia, `permisoTexto`, otros tipos de multimedia y estado de derechos; actualiza únicamente narración y procedencia de voz. El script entrega solo `historia` a la voz; no añade `resumen` ni `comoReconocerla`. `generacion-kokoro.json` identifica configuración, duraciones, nivel y hashes. El registro no sustituye escucha humana, revisión cruzada ni prueba móvil.

La versión inicial usaba Piper es_MX-ald-medium. Se conservan los WAV sin sufijo, el generador PowerShell y `voz-MODEL_CARD.txt` como material previo; ya no son las narraciones activas. Los manifiestos iniciales se conservaron como `audios-piper-original.json` y `version-piper-original.json`; sus capturas y medidas de duración documentan la versión anterior. Ver `docs/PRUEBA-S3.md` para resultados y pendientes.


## Bibliografía de demostración S3 (Karime)

Las tres constelaciones (`orion`, `osa-mayor`, `escorpio`) incorporan en el arreglo `libros` obras reales de acceso público en Internet (Project Gutenberg e Internet Archive). Se rotulan expresamente como `Referencia de demostración`.

La biblioteca **no se atribuye como poseedora** de las obras físicas ni se afirma disponibilidad de préstamo. La ficha del visor Homido adapta y muestra el título y autor verificados desde este registro documental. El detalle completo de fuentes, enlaces y condiciones de uso libres de derechos patrimoniales se encuentra en [BIBLIOGRAFIA.md](BIBLIOGRAFIA.md).
