import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir, hostname } from 'node:os'
import { join } from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'
import * as repo from '../src/services/documentRepository.js'

async function entorno(t) {
  const directorio = await fs.mkdtemp(join(tmpdir(), 'astrovisor-s4-write-'))
  t.after(async () => { await t.escritor?.cerrar(); await fs.rm(directorio, { recursive: true, force: true }) })
  await repo.inicializarCatalogo({ directorio })
  return directorio
}
const cambio = (titulo) => (c) => { c.libros[0].titulo = titulo }
const modulo = new URL('../src/services/documentRepository.js', import.meta.url).href
const ejecutar = (codigo, directorio) => execFileSync(process.execPath, ['--input-type=module', '-e', codigo], {
  env: { ...process.env, ASTROVISOR_DATA_DIR: directorio }, encoding: 'utf8', stdio: 'pipe',
})

for (const fase of ['cierre-temporal', 'cierre-directorio', 'control', 'apertura']) {
  test(`error original conserva prioridad ante limpieza de ${fase}`, async (t) => {
    const directorio = await entorno(t)
    const antes = await fs.readFile(join(directorio, 'catalogo.json'))
    const original = Object.assign(new Error('operación privada'), { code: 'EIO' })
    const secundario = Object.assign(new Error('limpieza privada'), { code: 'EACCES' })
    const io = { ...fs,
      open: async (ruta, ...args) => {
        if (fase === 'control' && ruta.endsWith('escritor.lock')) throw original
        if (fase === 'cierre-directorio' && ruta === join(directorio, 'backups')) return {
          sync: async () => { throw original }, close: async () => { throw secundario },
        }
        const h = await fs.open(ruta, ...args)
        if (fase !== 'cierre-temporal' || !ruta.endsWith('.tmp')) return h
        return { writeFile: async () => { throw original }, sync: () => h.sync(),
          close: async () => { await h.close(); throw secundario } }
      },
      lstat: async (ruta) => { if (fase === 'apertura' && ruta.endsWith('catalogo.json')) throw original; return fs.lstat(ruta) },
      unlink: async (ruta) => {
        if ((fase === 'control' && ruta.endsWith('control.lock')) || (fase === 'apertura' && ruta.endsWith('escritor.lock'))) throw secundario
        return fs.unlink(ruta)
      },
    }
    let fallo
    try {
      const escritor = t.escritor = await repo.abrirEscritor({ directorio, io })
      await escritor.guardar({ revision: 1, cambiar: cambio('No confirmado') })
    } catch (e) { fallo = e }
    assert.equal(fallo?.status, 503)
    assert.deepEqual(await fs.readFile(join(directorio, 'catalogo.json')), antes)
    assert.equal(fallo.cause, original)
    assert.deepEqual(fallo.cause.erroresLimpieza, [secundario])
    assert.equal((await fs.readdir(directorio)).some(n => n.endsWith('.tmp')), false)
    if (fase === 'control') assert.ok((await fs.readdir(directorio)).includes('control.lock'))
    if (fase === 'apertura') assert.ok((await fs.readdir(directorio)).includes('escritor.lock'))
  })
}

for (const fase of ['rename', 'writeFile', 'sync']) {
  for (const limpiezaFalla of [false, true]) {
    test(`error original ${fase} conserva EIO con limpieza ${limpiezaFalla ? 'EACCES pendiente' : 'correcta'}`, async (t) => {
      const directorio = await entorno(t)
      const previo = await repo.abrirEscritor({ directorio })
      try { await previo.guardar({ revision: 1, cambiar: cambio('Confirmación anterior') }) }
      finally { await previo.cerrar() }
      const [nombrePrevio] = await fs.readdir(join(directorio, 'backups'))
      const backupPrevio = await fs.readFile(join(directorio, 'backups', nombrePrevio))
      const antes = await fs.readFile(join(directorio, 'catalogo.json'))
      const original = Object.assign(new Error('fallo privado de operación'), { code: 'EIO' })
      const secundario = Object.assign(new Error('fallo privado de limpieza'), { code: 'EACCES' })
      let intentos = 0
      const escritor = t.escritor = await repo.abrirEscritor({ directorio, io: { ...fs,
        rename: async (...args) => { intentos++; if (fase === 'rename') throw original; return fs.rename(...args) },
        open: async (ruta, ...args) => {
          const h = await fs.open(ruta, ...args)
          if (!ruta.endsWith('.tmp') || fase === 'rename') return h
          return {
            writeFile: async (...v) => { if (fase === 'writeFile') throw original; return h.writeFile(...v) },
            sync: async () => { throw original },
            close: () => h.close(),
          }
        },
        unlink: async (ruta) => { if (limpiezaFalla && ruta.endsWith('.tmp')) throw secundario; return fs.unlink(ruta) },
      } })
      let fallo
      try { await escritor.guardar({ revision: 2, cambiar: cambio('No confirmado') }) }
      catch (e) { fallo = e }
      assert.ok(fallo, 'Una escritura no confirmada debe rechazarse')
      assert.equal(fallo.status, 503)
      assert.deepEqual(await fs.readFile(join(directorio, 'catalogo.json')), antes)
      const respaldos = await fs.readdir(join(directorio, 'backups'))
      assert.equal(respaldos.length, 2)
      assert.deepEqual(await fs.readFile(join(directorio, 'backups', nombrePrevio)), backupPrevio)
      const sobre = JSON.parse(await fs.readFile(join(directorio, 'backups', respaldos.find(n => n !== nombrePrevio)), 'utf8'))
      assert.deepEqual(sobre.catalogo, JSON.parse(antes))
      assert.equal(sobre.sha256, createHash('sha256').update(JSON.stringify(sobre.catalogo)).digest('hex'))
      assert.equal(intentos, fase === 'rename' ? 1 : 0, 'No reintentar EIO ni el guardado')
      assert.equal((await fs.readdir(directorio)).some(n => n.endsWith('.tmp')), limpiezaFalla)
      assert.equal(fallo.cause, original, 'La normalización 503 conserva la excepción original')
      assert.equal(fallo.cause.code, 'EIO')
      assert.equal(fallo.cause.erroresLimpieza?.length ?? 0, limpiezaFalla ? (fase === 'rename' ? 1 : 2) : 0)
      for (const e of fallo.cause.erroresLimpieza ?? []) assert.equal(e, secundario)
      assert.ok(!JSON.stringify(fallo).includes('fallo privado'), 'Diagnóstico interno no enumerable')
    })
  }
}

test('guardado exclusivo conserva metadatos y persiste al leer desde otro proceso', async (t) => {
  const directorio = await entorno(t)
  assert.equal(typeof repo.abrirEscritor, 'function', 'falta escritor documental')
  const original = await repo.obtenerCatalogo({ directorio })
  original.libros[0].metadatoDesconocido = { conservar: true }
  await fs.writeFile(join(directorio, 'catalogo.json'), JSON.stringify(original))
  const escritor = await repo.abrirEscritor({ directorio })
  t.escritor = escritor
  const resultado = await escritor.guardar({ revision: 1, cambiar: cambio('Título editado') })
  assert.equal(resultado.catalogo.revision, 2)
  const leido = JSON.parse(ejecutar(`import { obtenerCatalogo } from '${modulo}'; console.log(JSON.stringify(await obtenerCatalogo()))`, directorio))
  assert.equal(leido.libros[0].titulo, 'Título editado')
  assert.deepEqual(leido.libros[0].metadatoDesconocido, { conservar: true })
  assert.deepEqual(leido.recorridos, original.recorridos)
  const respaldos = await fs.readdir(join(directorio, 'backups'))
  assert.equal(respaldos.length, 1)
  const respaldo = JSON.parse(await fs.readFile(join(directorio, 'backups', respaldos[0]), 'utf8'))
  assert.deepEqual(respaldo.catalogo, original)
})

test('dos editores de revisión igual: solo uno confirma; segundo escritor y lock vivo se rechazan', async (t) => {
  const directorio = await entorno(t)
  const escritor = await repo.abrirEscritor({ directorio })
  t.escritor = escritor
  await assert.rejects(repo.abrirEscritor({ directorio }), { status: 503 })
  await assert.rejects(repo.retirarBloqueoAbandonado({ directorio }), { status: 503 })
  const resultados = await Promise.allSettled([1, 2].map((n) => escritor.guardar({ revision: 1, cambiar: cambio(`Editor ${n}`) })))
  assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 1)
  assert.equal(resultados.find((r) => r.status === 'rejected').reason.status, 412)
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 2)
})

test('dos procesos simultáneos no pueden ser escritores efectivos del mismo almacén', { timeout: 15000 }, async (t) => {
  assert.equal(typeof repo.abrirEscritor, 'function')
  const directorio = await entorno(t)
  const codigo = `import { abrirEscritor } from '${modulo}';
    try { const e = await abrirEscritor(); console.log('adquirido');
      process.stdin.once('data', async () => { await e.guardar({revision:1,cambiar:c=>{c.libros[0].titulo='Proceso ganador'}}); await e.cerrar(); process.exit(0) });
    } catch { console.log('rechazado'); process.exit(23) }`
  const hijos = [0, 1].map(() => spawn(process.execPath, ['--input-type=module', '-e', codigo], {
    env: { ...process.env, ASTROVISOR_DATA_DIR: directorio }, stdio: ['pipe', 'pipe', 'pipe'],
  }))
  t.after(() => { for (const h of hijos) if (h.exitCode === null) h.kill() })
  const salidas = await Promise.all(hijos.map((h) => once(h.stdout, 'data').then(([s]) => s.toString().trim())))
  assert.deepEqual([...salidas].sort(), ['adquirido', 'rechazado'])
  const ganador = hijos[salidas.indexOf('adquirido')]
  const salida = once(ganador, 'exit')
  ganador.stdin.end('guardar')
  assert.equal((await salida)[0], 0)
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 2)
})

for (const fase of ['backup', 'escritura', 'rename']) {
  test(`fallo de ${fase} conserva catálogo y revisión, sin éxito aparente`, async (t) => {
    const directorio = await entorno(t)
    const antes = await fs.readFile(join(directorio, 'catalogo.json'), 'utf8')
    const io = { ...fs,
      open: async (ruta, ...args) => {
        if ((fase === 'backup' && ruta.includes('backups')) || (fase === 'escritura' && ruta.endsWith('.tmp'))) {
          throw Object.assign(new Error('fallo inyectado'), { code: 'ENOSPC' })
        }
        return fs.open(ruta, ...args)
      },
      rename: async (...args) => { if (fase === 'rename') throw Object.assign(new Error('fallo inyectado'), { code: 'EACCES' }); return fs.rename(...args) },
    }
    const escritor = await repo.abrirEscritor({ directorio, io })
    t.escritor = escritor
    await assert.rejects(escritor.guardar({ revision: 1, cambiar: cambio('No confirmado') }), { status: 503 })
    assert.equal(await fs.readFile(join(directorio, 'catalogo.json'), 'utf8'), antes)
  })
}

test('validación fallida no modifica catálogo; retención se aplica solo tras confirmar', async (t) => {
  const directorio = await entorno(t)
  const escritor = await repo.abrirEscritor({ directorio })
  t.escritor = escritor
  await assert.rejects(escritor.guardar({ revision: 1, cambiar: (c) => { c.recorridos[0].libroRefs[0].libroId = 'ausente' } }), { status: 400 })
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 1)
  for (let revision = 1; revision <= 22; revision++) await escritor.guardar({ revision, cambiar: cambio(`Revisión ${revision + 1}`) })
  assert.equal((await fs.readdir(join(directorio, 'backups'))).length, 20)
})

test('corrupción no reinicializa; recuperación verifica respaldo, conserva evidencia y aumenta revisión', async (t) => {
  const directorio = await entorno(t)
  const escritor = await repo.abrirEscritor({ directorio })
  await escritor.guardar({ revision: 1, cambiar: cambio('Cambio previo') })
  const [respaldo] = await fs.readdir(join(directorio, 'backups'))
  await assert.rejects(repo.restaurarCatalogo({ directorio, respaldo, ultimaRevision: 2 }), { status: 503 })
  await escritor.cerrar()
  await fs.writeFile(join(directorio, 'catalogo.json'), '{corrupto')
  await assert.rejects(repo.abrirEscritor({ directorio }), { status: 503 })
  await assert.rejects(repo.restaurarCatalogo({ directorio, respaldo: '../catalogo.json', ultimaRevision: 2 }), { status: 400 })
  const r = await repo.restaurarCatalogo({ directorio, respaldo, ultimaRevision: 2 })
  assert.equal(r.catalogo.revision, 3)
  assert.equal(r.catalogo.libros[0].titulo, 'Star Lore of All Ages')
  const reiniciado = JSON.parse(ejecutar(`import { obtenerCatalogo } from '${modulo}'; console.log(JSON.stringify(await obtenerCatalogo()))`, directorio))
  assert.deepEqual(reiniciado, r.catalogo)
  assert.ok((await fs.readdir(directorio)).some((n) => n.startsWith('evidencia-')))
  const config = JSON.parse(await fs.readFile(join(directorio, 'backups', respaldo), 'utf8'))
  config.catalogo.libros[0].titulo = 'Respaldo manipulado'
  await fs.writeFile(join(directorio, 'backups', respaldo), JSON.stringify(config))
  await assert.rejects(repo.restaurarCatalogo({ directorio, respaldo, ultimaRevision: 3 }), { status: 503 })
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 3)
})

test('bloqueo abandonado requiere recuperación explícita y comprobar PID; no se retira por edad', async (t) => {
  const directorio = await entorno(t)
  ejecutar(`import { abrirEscritor } from '${modulo}'; await abrirEscritor(); process.exit(0)`, directorio)
  await assert.rejects(repo.abrirEscritor({ directorio }), { status: 503 })
  const lock = JSON.parse(await fs.readFile(join(directorio, 'escritor.lock'), 'utf8'))
  assert.equal(lock.host, hostname())
  await repo.retirarBloqueoAbandonado({ directorio })
  const escritor = await repo.abrirEscritor({ directorio })
  await escritor.cerrar()
})

test('reemplazo reintenta un error transitorio Windows sin borrar el destino', async (t) => {
  if (process.platform !== 'win32') return t.skip('Caso de reemplazo Windows')
  const directorio = await entorno(t)
  let intentos = 0
  const escritor = t.escritor = await repo.abrirEscritor({ directorio, io: { ...fs, rename: async (...args) => {
    if (++intentos === 1) throw Object.assign(new Error('ocupado'), { code: 'EPERM' })
    return fs.rename(...args)
  } } })
  assert.equal((await escritor.guardar({ revision: 1, cambiar: cambio('Reintento') })).catalogo.revision, 2)
  assert.ok(intentos >= 2 && intentos <= 6, 'reintento acotado, incluidos errores reales del sistema de archivos')
})

for (const despues of [false, true]) {
  test(`interrupción ${despues ? 'después' : 'antes'} de rename conserva una revisión completa`, async (t) => {
    const directorio = await entorno(t)
    const codigo = `import * as fs from 'node:fs/promises'; import { abrirEscritor } from '${modulo}';
      const e=await abrirEscritor({io:{...fs,rename:async(...args)=>{
        ${despues ? 'await fs.rename(...args);' : ''}process.exit(31)
      }}});await e.guardar({revision:1,cambiar:c=>{c.libros[0].titulo='Interrumpido'}})`
    assert.throws(() => ejecutar(codigo, directorio), (e) => e.status === 31)
    const catalogo = await repo.obtenerCatalogo({ directorio })
    assert.equal(catalogo.revision, despues ? 2 : 1)
    assert.equal(catalogo.libros[0].titulo, despues ? 'Interrumpido' : 'Star Lore of All Ages')
    assert.equal((await fs.readdir(join(directorio, 'backups'))).length, 1)
    await repo.retirarBloqueoAbandonado({ directorio })
    await (await repo.abrirEscritor({ directorio })).cerrar()
  })
}

test('un rename confirmado no se informa fallido por intentar borrar el temporal ya movido', async (t) => {
  const directorio = await entorno(t)
  let publicado = false
  const escritor = t.escritor = await repo.abrirEscritor({ directorio, io: { ...fs,
    rename: async (...args) => { await fs.rename(...args); publicado = true },
    unlink: async (ruta) => {
      if (publicado && ruta.endsWith('.tmp')) throw Object.assign(new Error('acceso denegado'), { code: 'EACCES' })
      return fs.unlink(ruta)
    },
  } })
  assert.equal((await escritor.guardar({ revision: 1, cambiar: cambio('Confirmado') })).catalogo.revision, 2)
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 2)
})

test('CLI de recuperación rechaza argumentos inválidos y restaura solo un respaldo privado validado', async (t) => {
  const directorio = await entorno(t)
  const escritor = await repo.abrirEscritor({ directorio })
  await escritor.guardar({ revision: 1, cambiar: cambio('Antes de recuperar') })
  await escritor.cerrar()
  const [respaldo] = await fs.readdir(join(directorio, 'backups'))
  const script = new URL('../../scripts/recuperar-catalogo.mjs', import.meta.url)
  const ejecutarCLI = (args) => execFileSync(process.execPath, [fileURLToPath(script), ...args], {
    env: { ...process.env, ASTROVISOR_DATA_DIR: directorio }, encoding: 'utf8', stdio: 'pipe',
  })
  assert.throws(() => ejecutarCLI(['restaurar', '../catalogo.json', '2']), (e) => e.status === 1 && e.stderr.includes('No se completó'))
  const salida = ejecutarCLI(['restaurar', respaldo, '2'])
  assert.ok(salida.includes('revisión 3'))
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 3)
  assert.ok((await fs.readdir(join(directorio, 'backups'))).some((n) => n.startsWith('catalogo-r2-')))
})

for (const fase of ['writeFile', 'sync']) {
  test(`fallo dentro de ${fase} del temporal conserva datos y cierra/retira el archivo parcial`, async (t) => {
    const directorio = await entorno(t)
    let cerrado = false
    const escritor = t.escritor = await repo.abrirEscritor({ directorio, io: { ...fs, open: async (ruta, ...args) => {
      const h = await fs.open(ruta, ...args)
      if (!ruta.endsWith('.tmp')) return h
      return {
        writeFile: async (...valores) => {
          if (fase === 'writeFile') { await h.writeFile('parcial'); throw Object.assign(new Error('disco lleno'), { code: 'ENOSPC' }) }
          return h.writeFile(...valores)
        },
        sync: async () => { throw Object.assign(new Error('fallo de disco'), { code: 'EIO' }) },
        close: async () => { await h.close(); cerrado = true },
      }
    } } })
    await assert.rejects(escritor.guardar({ revision: 1, cambiar: cambio('No confirmado') }), { status: 503 })
    assert.equal(cerrado, true)
    assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 1)
    assert.ok(!(await fs.readdir(directorio)).some((n) => n.endsWith('.tmp')))
  })
}

test('fallo de mantenimiento posterior se informa como advertencia con persistencia confirmada', async (t) => {
  const directorio = await entorno(t)
  let publicado = false
  const escritor = t.escritor = await repo.abrirEscritor({ directorio, io: { ...fs,
    rename: async (...args) => { await fs.rename(...args); publicado = true },
    open: async (ruta, ...args) => {
      if (publicado && ruta === directorio) return { sync: async () => { throw new Error('fallo posterior') }, close: async () => {} }
      return fs.open(ruta, ...args)
    },
    readdir: async (...args) => { if (publicado) throw new Error('fallo de retención'); return fs.readdir(...args) },
  } })
  const r = await escritor.guardar({ revision: 1, cambiar: cambio('Confirmado con aviso') })
  assert.equal(r.durabilidadPendiente, true)
  assert.equal(r.retencionPendiente, true)
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 2)
})

test('respaldo enlazado se rechaza sin escribir fuera del directorio privado', async (t) => {
  const directorio = await entorno(t)
  const exterior = join(directorio, 'no-es-backup')
  await fs.mkdir(exterior)
  await fs.symlink(exterior, join(directorio, 'backups'), process.platform === 'win32' ? 'junction' : 'dir')
  const escritor = t.escritor = await repo.abrirEscritor({ directorio })
  await assert.rejects(escritor.guardar({ revision: 1, cambiar: cambio('No permitido') }), { status: 503 })
  assert.deepEqual(await fs.readdir(exterior), [])
})

test('fallo previo al commit no poda respaldos, aunque supere temporalmente veinte copias', async (t) => {
  const directorio = await entorno(t)
  let escritor = t.escritor = await repo.abrirEscritor({ directorio })
  for (let revision = 1; revision <= 20; revision++) await escritor.guardar({ revision, cambiar: cambio(`Guardado ${revision}`) })
  const antes = await fs.readdir(join(directorio, 'backups'))
  await escritor.cerrar()
  escritor = t.escritor = await repo.abrirEscritor({ directorio, io: { ...fs, rename: async () => { throw Object.assign(new Error('fallo'), { code: 'EIO' }) } } })
  await assert.rejects(escritor.guardar({ revision: 21, cambiar: cambio('No confirmado') }), { status: 503 })
  const despues = await fs.readdir(join(directorio, 'backups'))
  assert.equal(despues.length, 21)
  assert.ok(antes.every((n) => despues.includes(n)))
  assert.equal((await repo.obtenerCatalogo({ directorio })).revision, 21)
})

test('control.lock existente bloquea alta y recuperación automática sin retirarlo por timeout', async (t) => {
  const directorio = await entorno(t)
  const archivo = join(directorio, 'control.lock')
  const contenido = JSON.stringify({ pid: process.pid, host: hostname() })
  await fs.writeFile(archivo, contenido)
  await assert.rejects(repo.abrirEscritor({ directorio }), { status: 503 })
  await assert.rejects(repo.retirarBloqueoAbandonado({ directorio }), { status: 503 })
  assert.equal(await fs.readFile(archivo, 'utf8'), contenido)
})

test('restauración explícita recupera también un catálogo ausente sin consultar la semilla', async (t) => {
  const directorio = await entorno(t)
  const escritor = await repo.abrirEscritor({ directorio })
  await escritor.guardar({ revision: 1, cambiar: cambio('Estado posterior') })
  await escritor.cerrar()
  const [respaldo] = await fs.readdir(join(directorio, 'backups'))
  await fs.rm(join(directorio, 'catalogo.json'))
  const r = await repo.restaurarCatalogo({ directorio, respaldo, ultimaRevision: 2 })
  assert.equal(r.catalogo.revision, 3)
  assert.equal(r.catalogo.libros[0].titulo, 'Star Lore of All Ages')
})
