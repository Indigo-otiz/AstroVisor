import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { spawnSync, execFileSync } from 'node:child_process'
import { inicializarCatalogo, obtenerCatalogo, abrirEscritor } from '../src/services/documentRepository.js'

const modulo = new URL('../src/services/documentRepository.js', import.meta.url).href
const cli = new URL('../../scripts/recuperar-catalogo.mjs', import.meta.url).href
async function entorno(t) {
  const directorio = await fs.mkdtemp(join(tmpdir(), 'astrovisor-restore-regresion-'))
  assert.equal(dirname(directorio), tmpdir())
  t.after(() => fs.rm(directorio, { recursive: true, force: true }))
  await inicializarCatalogo({ directorio })
  const original = await obtenerCatalogo({ directorio })
  original.metadatosDesconocidos = { conservar: 'contenido previo' }
  await fs.writeFile(join(directorio, 'catalogo.json'), JSON.stringify(original))
  const escritor = await abrirEscritor({ directorio })
  try { await escritor.guardar({ revision: 1, cambiar: c => { c.libros[0].titulo = 'Estado posterior' } }) }
  finally { await escritor.cerrar() }
  const [respaldo] = await fs.readdir(join(directorio, 'backups'))
  return { directorio, respaldo, original }
}

function programa(directorio, respaldo, modo, usarCLI = false) {
  return `
    import * as fs from 'node:fs/promises'; import {mock} from 'node:test';
    const dir=${JSON.stringify(directorio)}, modo=${JSON.stringify(modo)};
    let confirmaciones=0, liberaciones=0;
    const error=(code)=>Object.assign(new Error('NO-PUBLICAR '+dir),{code});
    mock.module('node:fs/promises',{namedExports:{...fs,
      rename:async(...args)=>{if(['operacion','ambos'].includes(modo))throw error('EIO');await fs.rename(...args);confirmaciones++},
      unlink:async(ruta)=>{if(ruta.endsWith('escritor.lock')){liberaciones++;if(['liberacion','ambos'].includes(modo))throw error('EACCES')}return fs.unlink(ruta)},
      open:async(ruta,...args)=>{if(modo==='sync'&&confirmaciones&&ruta===dir)throw error('EIO');return fs.open(ruta,...args)},
    }});
    ${usarCLI ? `process.env.ASTROVISOR_DATA_DIR=dir;
      process.argv=[process.execPath,'recuperar-catalogo.mjs','restaurar',${JSON.stringify(respaldo)},'2'];await import(${JSON.stringify(cli)});`
      : `const repo=await import(${JSON.stringify(modulo)});let resultado,errorOperacion;
      try{resultado=await repo.restaurarCatalogo({directorio:dir,respaldo:${JSON.stringify(respaldo)},ultimaRevision:2})}
      catch(e){errorOperacion={status:e.status,code:e.code,confirmada:e.confirmada,revisionPersistida:e.revisionPersistida,limpiezaPendiente:e.limpiezaPendiente,codigoLimpieza:e.codigoLimpieza}}
      const antes=liberaciones;let bloqueoActivoProtegido=null;
      if(['liberacion','ambos'].includes(modo)){
        try{await repo.retirarBloqueoAbandonado({directorio:dir});bloqueoActivoProtegido=false}
        catch(e){bloqueoActivoProtegido=e.status===503&&antes===liberaciones}
      }
      console.log(JSON.stringify({resultado,errorOperacion,confirmaciones,liberaciones,bloqueoActivoProtegido}));`}
  `
}

for (const modo of ['normal', 'liberacion', 'operacion', 'ambos', 'sync']) {
  test(`restauración ${modo}: resultado distingue confirmación, operación y limpieza`, async (t) => {
    const { directorio, respaldo, original } = await entorno(t)
    const salida = spawnSync(process.execPath, ['--experimental-test-module-mocks', '--input-type=module', '-e', programa(directorio, respaldo, modo)], { encoding: 'utf8', timeout: 15000 })
    assert.equal(salida.status, 0, salida.stderr)
    const d = JSON.parse(salida.stdout), confirmada = !['operacion', 'ambos'].includes(modo)
    const estado = confirmada ? d.resultado : d.errorOperacion
    assert.ok(estado, 'El resultado debe comunicar el estado real de confirmación, aunque falle la limpieza')
    assert.equal(estado.confirmada, confirmada)
    assert.equal(estado.revisionPersistida, confirmada ? 3 : null)
    assert.equal(estado.limpiezaPendiente, ['liberacion', 'ambos'].includes(modo))
    assert.equal(estado.codigoLimpieza, ['liberacion', 'ambos'].includes(modo) ? 'EACCES' : null)
    assert.equal(d.confirmaciones, confirmada ? 1 : 0)
    if (!confirmada) { assert.equal(estado.status, 503); assert.equal(estado.code, 'EIO') }
    if (modo === 'sync') assert.equal(estado.durabilidadPendiente, true)
    const leido = await obtenerCatalogo({ directorio })
    assert.equal(leido.revision, confirmada ? 3 : 2)
    assert.equal(leido.libros[0].titulo, confirmada ? original.libros[0].titulo : 'Estado posterior')
    assert.deepEqual(leido.metadatosDesconocidos, original.metadatosDesconocidos)
    assert.deepEqual(leido.recorridos, original.recorridos)
    if (confirmada) {
      assert.deepEqual(leido.libros, original.libros)
      const reiniciado = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `import{obtenerCatalogo}from ${JSON.stringify(modulo)};console.log(JSON.stringify(await obtenerCatalogo()))`], {
        env: { ...process.env, ASTROVISOR_DATA_DIR: directorio }, encoding: 'utf8', timeout: 15000,
      }))
      assert.deepEqual(reiniciado, leido)
    }
    if (estado.limpiezaPendiente) {
      assert.equal(d.bloqueoActivoProtegido, true)
      assert.ok((await fs.readdir(directorio)).includes('escritor.lock'))
      await assert.rejects(abrirEscritor({ directorio }), { status: 503 })
    }
  })
}

for (const modo of ['liberacion', 'operacion', 'ambos']) {
  test(`CLI ${modo}: distingue intervención de limpieza de restauración no confirmada`, async (t) => {
    const { directorio, respaldo } = await entorno(t)
    const salida = spawnSync(process.execPath, ['--experimental-test-module-mocks', '--input-type=module', '-e', programa(directorio, respaldo, modo, true)], { encoding: 'utf8', timeout: 15000 })
    assert.equal(salida.status, modo === 'liberacion' ? 2 : 1)
    if (modo === 'liberacion') {
      assert.match(salida.stdout, /restauración confirmada.*revisión 3/i)
      assert.match(salida.stderr, /no repitas automáticamente/i)
      assert.match(salida.stderr, /puede impedir nuevas escrituras/i)
    } else assert.match(salida.stderr, /restauración no confirmada/i)
    if (modo !== 'operacion') assert.match(salida.stderr, /EACCES/)
    assert.ok(!salida.stdout.includes(directorio) && !salida.stderr.includes(directorio))
    assert.ok(!salida.stdout.includes('NO-PUBLICAR') && !salida.stderr.includes('NO-PUBLICAR'))
    assert.equal((await obtenerCatalogo({ directorio })).revision, modo === 'liberacion' ? 3 : 2)
  })
}
