import { createInterface, emitKeypressEvents } from 'node:readline'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { inicializarAdmin } from '../backend/src/services/adminCredentials.js'

export function leerSecreto(input, output, mensaje) {
  if (!input.isTTY || !output.isTTY) return Promise.reject(new Error('Se requiere una terminal interactiva'))
  return new Promise((resolve, reject) => {
    let secreto = ''
    const rawAnterior = input.isRaw
    emitKeypressEvents(input)
    output.write(mensaje)
    function finalizar(error) {
      input.removeListener('keypress', tecla)
      input.setRawMode(Boolean(rawAnterior))
      input.pause()
      output.write('\n')
      if (error) reject(error)
      else resolve(secreto)
    }
    function tecla(caracter, key = {}) {
      if (key.ctrl && key.name === 'c') return finalizar(new Error('Operación cancelada'))
      if (key.name === 'return' || key.name === 'enter') return finalizar()
      if (key.name === 'backspace') secreto = Array.from(secreto).slice(0, -1).join('')
      else if (!key.ctrl && !key.meta && caracter && !/[\x00-\x1f\x7f]/.test(caracter)) secreto += caracter
      if (secreto.length > 256 || Buffer.byteLength(secreto) > 1024) finalizar(new Error('Contraseña demasiado larga'))
    }
    input.setRawMode(true)
    input.on('keypress', tecla)
    input.resume()
  })
}

async function principal() {
  if (process.argv.length !== 2 || !process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Usa una terminal interactiva sin argumentos ni redirecciones')
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const preguntar = (mensaje) => new Promise((resolve) => rl.question(mensaje, resolve))
  const usuario = (await preguntar('Usuario administrativo: ')).trim()
  const nombre = (await preguntar('Nombre visible: ')).trim()
  rl.close()
  const password = await leerSecreto(process.stdin, process.stdout, 'Contraseña (entrada oculta, mínimo 15 caracteres): ')
  const confirmacion = await leerSecreto(process.stdin, process.stdout, 'Repetir contraseña (entrada oculta): ')
  if (password !== confirmacion) throw new Error('Las contraseñas no coinciden')
  await inicializarAdmin({ usuario, nombre, password })
  console.log('Configuración privada creada. No se sobrescribió ningún archivo existente.')
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  principal().catch(() => {
    console.error('No se creó la cuenta. Revisa la ruta privada, el destino inexistente y los requisitos de entrada; no se muestran credenciales.')
    process.exitCode = 1
  })
}
