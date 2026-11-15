"""Prepara contornos; herramienta offline (OpenCV + NumPy), no dependencia web.
Uso: python scripts/generar-relieves.py RUTA_IT_TEPIC RUTA_BIBLIOTECA
"""
import hashlib
import json
import sys
from pathlib import Path

import cv2
import numpy as np

DESTINO = Path(__file__).resolve().parents[1] / 'frontend/public/prueba-homido/logos'


def formas(mask, ancho, alto, tolerancia=0.45):
    contornos, jerarquia = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    if jerarquia is None:
        return []

    def puntos(contorno):
        aproximado = cv2.approxPolyDP(contorno, tolerancia, True).reshape(-1, 2)
        return [[round(float(x / ancho - 0.5), 6), round(float((alto / 2 - y) / ancho), 6)]
                for x, y in aproximado]

    resultado = []
    for i, contorno in enumerate(contornos):
        if jerarquia[0][i][3] != -1 or cv2.contourArea(contorno) < 2:
            continue
        exterior = puntos(contorno)
        if len(exterior) < 3:
            continue
        huecos = []
        hijo = jerarquia[0][i][2]
        while hijo != -1:
            hueco = puntos(contornos[hijo])
            if len(hueco) >= 3:
                huecos.append(hueco)
            hijo = jerarquia[0][hijo][0]
        resultado.append({'outer': exterior, 'holes': huecos})
    return resultado


def generar(tepic, biblioteca):
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nombre, ruta in [('tepic', tepic), ('biblioteca', biblioteca)]:
        contenido = ruta.read_bytes()
        imagen = cv2.imdecode(np.frombuffer(contenido, np.uint8), cv2.IMREAD_COLOR)
        if imagen is None:
            raise ValueError(f'Imagen ilegible: {ruta}')
        alto, ancho = imagen.shape[:2]
        capas = []

        def capa(color, mask, z, depth):
            figuras = formas(mask, ancho, alto)
            if figuras:
                capas.append({'color': color, 'z': z, 'depth': depth, 'shapes': figuras})

        if nombre == 'biblioteca':
            tinta = (cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY) < 128).astype(np.uint8) * 255
            # El soporte sigue las letras y el retrato: sin cartel rectangular.
            soporte = cv2.dilate(tinta, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
            exteriores, _ = cv2.findContours(soporte, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(soporte, exteriores, -1, 255, cv2.FILLED)
            capa('#eadfc4', soporte, 0, 0.018)
            capa('#11151d', tinta, 0.018, 0.012)
        else:
            gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
            contornos, _ = cv2.findContours((gris < 235).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            silueta = np.zeros_like(gris)
            cv2.drawContours(silueta, [c for c in contornos if cv2.contourArea(c) > 12], -1, 255, cv2.FILLED)
            capa('#171b24', silueta, 0, 0.035)
            colores = ['#13171d', '#fff6d0', '#ff922c', '#087bbf', '#15954e', '#ffffff']
            paleta = np.array([tuple(bytes.fromhex(c[1:])) for c in colores], dtype=np.float32)
            rgb = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB).astype(np.float32)
            regiones = np.argmin(((rgb[:, :, None, :] - paleta) ** 2).sum(axis=3), axis=2)
            for i, color in enumerate(colores):
                mask = ((regiones == i) & (silueta > 0)).astype(np.uint8) * 255
                capa(color, mask, 0.035, 0.013 if i == 0 else 0.009)

        datos = {'sourceSha256': hashlib.sha256(contenido).hexdigest(),
                 'width': ancho, 'height': alto, 'layers': capas}
        if nombre == 'tepic':
            datos['texture'] = '../ITTepic_logo.jpg'
        assert capas and all(c['depth'] > 0 for c in capas)
        assert sum(len(s['holes']) for c in capas for s in c['shapes']) > 0
        salida = DESTINO / f'{nombre}.json'
        salida.write_text(json.dumps(datos, separators=(',', ':')) + '\n', encoding='utf-8')
        print(f'{nombre}: {len(capas)} capas, {salida.stat().st_size} bytes')


def comprobar():
    mask = np.zeros((30, 30), np.uint8)
    mask[2:28, 2:28] = 255
    mask[10:20, 10:20] = 0
    resultado = formas(mask, 30, 30)
    assert len(resultado) == 1 and len(resultado[0]['holes']) == 1
    assert len(resultado[0]['outer']) == 4
    assert formas(np.zeros_like(mask), 30, 30) == []
    print('Contorno exterior, hueco y máscara vacía: OK')


if __name__ == '__main__':
    comprobar()
    if len(sys.argv) != 3:
        raise SystemExit('Uso: python scripts/generar-relieves.py RUTA_IT_TEPIC RUTA_BIBLIOTECA')
    generar(Path(sys.argv[1]), Path(sys.argv[2]))
