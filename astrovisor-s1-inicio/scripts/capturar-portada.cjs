const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function capture(width, height, filename, scrollY = 0) {
  return new Promise((resolve, reject) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-ss-'));
    const out = path.join('C:\\Users\\aneao\\.gemini\\antigravity\\brain\\5bcac432-61df-4746-983b-96cb5f2aee5c\\capturas', filename);
    const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    const child = spawn(chrome, [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      `--user-data-dir=${tempDir}`,
      `--window-size=${width},${height}`,
      `--screenshot=${out}`,
      'http://localhost:5173/'
    ]);

    child.on('close', (code) => {
      console.log(`Captured ${filename} (${width}x${height}): code ${code}`);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}
      resolve();
    });
  });
}

async function run() {
  await capture(1280, 800, 'nueva-portada-glass.png');
}

run();
