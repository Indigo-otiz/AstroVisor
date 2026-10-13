import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../apps/api/src/app.js';

test('API: salud, catálogo consistente y rutas desconocidas', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, 'ok');
    const response = await fetch(`${base}/api/planets`);
    assert.equal(response.status, 200);
    const planets = await response.json();
    assert.ok(planets.length >= 3);
    assert.deepEqual(planets.map((p: {nombre: string}) => p.nombre), ['Tierra', 'Marte', 'Júpiter']);
    assert.equal(new Set(planets.map((p: {id: string}) => p.id)).size, planets.length);
    for (const p of planets) {
      for (const key of ['id','nombre','tipo','descripcion']) assert.equal(typeof p[key], 'string');
      assert.ok(p.radioVisual > 0 && Number.isFinite(p.radioVisual));
      assert.match(p.colorVisual, /^#[\da-f]{6}$/i);
    }
    assert.equal((await fetch(`${base}/api/missing`)).status, 404);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
