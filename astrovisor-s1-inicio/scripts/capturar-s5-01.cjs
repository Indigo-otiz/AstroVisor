const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const servirS4 = require('./servidor-pruebas-s4.cjs');

function runChromeAsync(chrome, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, args, { stdio: 'ignore' });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Timeout de captura'));
    }, 12000);

    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`Chrome finalizó con código ${code}`));
    });
  });
}

async function main() {
  console.log('Iniciando servidor de pruebas S4/S5...');
  const cerrar = await servirS4();

  const tempUserDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-capture-'));

  try {
    const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const outDir = path.resolve(__dirname, '../docs/evidencias-s5');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const shots = [
      {
        name: '01-inicio-escritorio-viewport-1366.png',
        width: 1366,
        height: 768,
        desc: 'Primer viewport escritorio 1366x768'
      },
      {
        name: '01-inicio-escritorio-viewport-1280.png',
        width: 1280,
        height: 800,
        desc: 'Primer viewport escritorio 1280x800'
      },
      {
        name: '02-inicio-movil-viewport-390.png',
        width: 390,
        height: 844,
        desc: 'Primer viewport móvil 390x844'
      },
      {
        name: '01-inicio-escritorio-completo.png',
        width: 1280,
        height: 2000,
        desc: 'Página completa escritorio 1280px'
      },
      {
        name: '02-inicio-movil-completo.png',
        width: 390,
        height: 2800,
        desc: 'Página completa móvil 390px'
      }
    ];

    for (const shot of shots) {
      const target = path.join(outDir, shot.name);
      console.log(`Capturando: ${shot.desc} (${shot.width}x${shot.height}) -> ${shot.name}...`);
      
      const args = [
        '--headless=new',
        `--user-data-dir=${tempUserDir}`,
        '--disable-gpu',
        '--no-first-run',
        '--disable-background-networking',
        `--window-size=${shot.width},${shot.height}`,
        `--screenshot=${target}`,
        'http://127.0.0.1:5194/'
      ];

      await runChromeAsync(chrome, args);
      const stats = fs.statSync(target);
      console.log(`  -> Éxito: ${stats.size} bytes`);
    }

    console.log('Capturas generadas con éxito en:', outDir);
  } finally {
    console.log('Cerrando servidor...');
    await cerrar();
    try {
      fs.rmSync(tempUserDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(err => {
  console.error('Error en capturas:', err);
  process.exit(1);
});
