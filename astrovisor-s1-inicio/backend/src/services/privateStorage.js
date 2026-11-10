import { realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { isAbsolute, relative, dirname, basename, resolve, sep } from 'node:path'

const checkout = fileURLToPath(new URL('../../../../', import.meta.url))
const dentro = (raiz, ruta) => {
  const distancia = relative(raiz, ruta)
  return distancia === '' || (!isAbsolute(distancia) && distancia !== '..' && !distancia.startsWith(`..${sep}`))
}

export async function rutaPrivada(directorio) {
  if (typeof directorio !== 'string' || !isAbsolute(directorio)) throw new Error('Configura una ruta privada absoluta fuera del checkout')
  const ruta = resolve(directorio)
  if (dentro(checkout, ruta)) throw new Error('El almacenamiento privado debe estar fuera del checkout')
  let ancestro = ruta
  const pendientes = []
  while (true) {
    try {
      const real = resolve(await realpath(ancestro), ...pendientes)
      if (dentro(await realpath(checkout), real)) throw new Error('El directorio privado apunta al checkout')
      return ruta
    } catch (error) {
      if (error.code !== 'ENOENT' || dirname(ancestro) === ancestro) throw error
      pendientes.unshift(basename(ancestro))
      ancestro = dirname(ancestro)
    }
  }
}
