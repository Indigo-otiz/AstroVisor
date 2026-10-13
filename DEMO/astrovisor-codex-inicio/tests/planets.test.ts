import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPlanets } from '../apps/web/src/planets.js';

test('cliente rechaza errores HTTP, catálogo vacío y esquema inválido', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('{}', {status: 503});
    await assert.rejects(loadPlanets(), /API/);
    for (const value of [[], {}, [{id: 'x'}], [{id:'x', nombre:'X', tipo:'x', descripcion:'x', radioVisual:-1, colorVisual:'red'}]]) {
      globalThis.fetch = async () => Response.json(value);
      await assert.rejects(loadPlanets(), /catálogo/);
    }
  } finally { globalThis.fetch = original; }
});

test('cliente consume el endpoint, conserva datos válidos y rechaza IDs duplicados', async () => {
  const original = globalThis.fetch;
  const fixture = {id:'demo', nombre:'Ejemplo', tipo:'Demostración', descripcion:'Texto de prueba', radioVisual:1, colorVisual:'#123abc'};
  try {
    globalThis.fetch = async (input, options) => {
      assert.equal(input, '/api/planets');
      assert.ok(options?.signal instanceof AbortSignal);
      return Response.json([fixture]);
    };
    assert.deepEqual(await loadPlanets(new AbortController().signal), [fixture]);
    globalThis.fetch = async () => Response.json([fixture, fixture]);
    await assert.rejects(loadPlanets(), /catálogo/);
  } finally { globalThis.fetch = original; }
});
