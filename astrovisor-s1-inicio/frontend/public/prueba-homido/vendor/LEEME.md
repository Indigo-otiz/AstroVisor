# Recursos de terceros incluidos localmente

La escena no depende de ningún CDN. Los archivos se descargaron sin modificar el 29 de octubre de 2026.

| Archivo | Versión / origen | Licencia | SHA-256 |
|---|---|---|---|
| `aframe.min.js` | A-Frame 1.8.0 — https://aframe.io/releases/1.8.0/aframe.min.js | MIT (`LICENSE-aframe.txt`, de https://github.com/aframevr/aframe/blob/v1.8.0/LICENSE) | `27a49c530c18c0710f5d0b9492934d5ba6670fe492be37a5e5ea890f26a9864f` |
| `THIRD-PARTY-NOTICES.txt` | Avisos de copyright y licencias de las dependencias de producción de A-Frame 1.8.0 (ver abajo) | MIT, BSD-3-Clause e ISC (textos originales dentro del archivo) | — |

Notas:
- `aframe.min.js` contiene referencias a URLs externas (decodificador Draco de gstatic, inspector en unpkg, logotipo de aframe.io) que solo se usan con modelos glTF comprimidos, el inspector o la interfaz VR integrada; esta escena no las utiliza (`vr-mode-ui` está desactivado).
- Para actualizar A-Frame: reemplazar el archivo, actualizar esta tabla y repetir la prueba física.
- Esto elimina la dependencia de CDN, **no** la necesidad de HTTPS para los sensores del teléfono.

## Integridad del archivo `aframe.min.js`

- SHA-256 del archivo **oficial** descargado de https://aframe.io/releases/1.8.0/aframe.min.js (verificado de nuevo el 31-oct-2026): `27a49c53…a9864f` (el de la tabla).
- El archivo **local** tiene SHA-256 `33304c70eac93a912669456d8f0ab69cce5a4de0d70f1bc99ffdcb4b4d6a9ed8` y 1 byte más: la única diferencia es que el primer salto de línea del archivo (antes del comentario `sourceMappingURL`) es CRLF en vez de LF, probablemente por la descarga en Windows. Al convertir ese CRLF a LF, el SHA-256 coincide exactamente con el oficial. El archivo no se ha modificado en esta revisión.

## Licencias y avisos de A-Frame y sus dependencias (revisado el 31-oct-2026)

- **A-Frame 1.8.0**: MIT, «Copyright © 2015-2026 A-Frame authors» (`LICENSE-aframe.txt`, del repositorio oficial en la etiqueta v1.8.0). El archivo oficial `aframe.min.js` es un paquete webpack minificado **sin banners de copyright** de sus dependencias (0 apariciones de `@license`/`Copyright`, tanto en el oficial como en la copia local).
- **Dependencias empaquetadas**: A-Frame 1.8.0 declara 8 dependencias de producción (`buffer`, `debug`, `deep-assign`, `load-bmfont`, `stats-gl`, `super-animejs`, `three` = `npm:super-three@0.184.0`, `three-bmfont-text`) y, con sus dependencias transitivas según su `package-lock.json` oficial, 38 paquetes (36 MIT, `ieee754` BSD-3-Clause y `sax` ISC). `THIRD-PARTY-NOTICES.txt` reúne los textos originales de licencia de cada uno, copiados sin modificar del paquete npm publicado (o, para `word-wrapper`, `parse-bmfont-ascii` y `three-bmfont-text`, del repositorio oficial de GitHub, por no incluir archivo de licencia el paquete o ser un enlace git).
- **Limitaciones, sin inventar nada:** (1) no se verificó módulo por módulo cuáles de esas dependencias están dentro del bundle; se listan todas las de producción para no omitir ningún aviso; (2) `stats-gl 3.6.0` y `buffer-equal 0.0.1` declaran licencia MIT en su `package.json` pero no publican archivo de licencia ni aviso de copyright (tampoco su repositorio): `THIRD-PARTY-NOTICES.txt` lo indica expresamente; (3) `dom-walk` y `min-document` declaran MIT en un campo `licenses` antiguo; su archivo `LICENCE` está incluido.
- **Fuentes tipográficas:** ninguna se distribuye. El bundle hace referencia a fuentes alojadas en cdn.aframe.io (p. ej. `Roboto-msdf.json`) solo para el componente `a-text`, que esta escena no usa. Los textos de la página usan fuentes del sistema (`Arial`, `system-ui`).
- Sigue pendiente, como siempre, confirmar en el visor físico; esto es solo una corrección documental.
