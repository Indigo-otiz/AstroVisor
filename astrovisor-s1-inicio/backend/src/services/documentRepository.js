import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const recorridosPath = fileURLToPath(new URL('../../../content/recorridos.json', import.meta.url))

/** Adaptador documental de solo lectura del Sprint 1. */
export async function obtenerRecorridos() {
  const texto = await readFile(recorridosPath, 'utf8')
  const datos = JSON.parse(texto)
  if (!Array.isArray(datos)) throw new Error('El archivo de recorridos debe contener un arreglo')
  return datos
}
