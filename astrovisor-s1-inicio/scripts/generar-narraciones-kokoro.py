"""Genera WAV locales con la voz femenina elegida por Luis; no usa servicios TTS."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

parser = argparse.ArgumentParser()
parser.add_argument('--motor', required=True, help='Carpeta con modelo, voces y dependencias en deps/')
parser.add_argument('--muestra-orion', help='Muestra femenina presentada, con muestras.json junto al WAV')
args = parser.parse_args()
motor = Path(args.motor)
sys.path.insert(0, str(motor / 'deps'))
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

raiz = Path(__file__).resolve().parent.parent
fichas = json.loads((raiz / 'content/recorridos.json').read_text(encoding='utf-8-sig'))
salida = raiz / 'frontend/public/audio'
sintetizador = Kokoro(str(motor / 'kokoro-v1.0.onnx'), str(motor / 'voices-v1.0.bin'))

def sintetizar_lote(fonemas, estilo, velocidad):
    # El export v1.1 exige speed float32; el runtime 0.4.9 usa int32 para input_ids.
    tokens = sintetizador.tokenizer.tokenize(fonemas)
    nombre = 'input_ids' if 'input_ids' in [i.name for i in sintetizador.sess.get_inputs()] else 'tokens'
    entradas = {nombre: np.array([[0, *tokens, 0]], dtype=np.int64),
                'style': np.array(estilo[len(tokens)], dtype=np.float32),
                'speed': np.array([velocidad], dtype=np.float32)}
    return sintetizador.sess.run(None, entradas)[0], 24000

sintetizador._create_audio = sintetizar_lote
resultados = []
for ficha in fichas:
    guion = ficha['historia']
    archivo = salida / f"{ficha['id']}-kokoro-v1.wav"
    if ficha['id'] == 'orion' and args.muestra_orion:
        muestra = Path(args.muestra_orion)
        datos = json.loads((muestra.parent / 'muestras.json').read_text(encoding='utf-8'))
        if datos['guion'] != guion or not any(x['archivo'] == muestra.name and x['voz'] == 'ef_dora' for x in datos['muestras']):
            raise RuntimeError('La muestra de Orión no corresponde al guion y voz elegidos')
        audio, tasa = sf.read(str(muestra), dtype='float32')
        archivo.write_bytes(muestra.read_bytes())
    else:
        audio, tasa = sintetizador.create(guion, voice='ef_dora', speed=0.96, lang='es-419')
        audio = np.asarray(audio, dtype=np.float32)
        if len(audio) == 0 or not np.isfinite(audio).all():
            raise RuntimeError('Señal inválida')
        rms = float(np.sqrt(np.mean(audio ** 2)))
        pico = float(np.max(np.abs(audio)))
        if min(rms, pico) <= 0:
            raise RuntimeError('Señal en silencio')
        audio *= min(0.11 / rms, 0.84 / pico)
        n = min(int(tasa * 0.012), len(audio) // 2)
        audio[:n] *= np.linspace(0, 1, n)
        audio[-n:] *= np.linspace(1, 0, n)
        sf.write(str(archivo), audio, tasa, subtype='PCM_16')
    (salida / f"{ficha['id']}.txt").write_text(guion + '\n', encoding='utf-8')
    exportado, tasa = sf.read(str(archivo), dtype='float32')
    pico = float(np.max(np.abs(exportado)))
    if tasa != 24000 or exportado.ndim != 1 or not np.isfinite(exportado).all() or pico >= 1:
        raise RuntimeError('El WAV exportado no cumple el formato o tiene saturación')
    registro = {'id': ficha['id'], 'src': f'/audio/{archivo.name}', 'voz': 'ef_dora',
                'segundos': len(exportado) / tasa, 'tasa': tasa, 'bits': 16, 'canales': 1,
                'picoDbFS': float(20 * np.log10(pico)), 'rmsDbFS': float(20 * np.log10(np.sqrt(np.mean(exportado ** 2)))),
                'clipping': False, 'sha256': hashlib.sha256(archivo.read_bytes()).hexdigest()}
    resultados.append(registro)
    print(json.dumps(registro, ensure_ascii=False), flush=True)
evidencia = raiz / 'docs/evidencias/s3/generacion-kokoro.json'
evidencia.write_text(json.dumps({'modelo': 'Kokoro-82M v1.0', 'export': 'model-files-v1.1',
    'runtime': 'kokoro-onnx 0.4.9', 'voz': 'ef_dora', 'fonetica': 'es-419', 'velocidad': 0.96,
    'modeloSHA256': hashlib.sha256((motor / 'kokoro-v1.0.onnx').read_bytes()).hexdigest(),
    'vocesSHA256': hashlib.sha256((motor / 'voices-v1.0.bin').read_bytes()).hexdigest(),
    'licenciaModelo': 'Apache-2.0', 'escuchaHumanaCompleta': 'pendiente', 'archivos': resultados}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
