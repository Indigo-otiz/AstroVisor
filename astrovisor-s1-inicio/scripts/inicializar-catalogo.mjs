import { inicializarCatalogo } from '../backend/src/services/documentRepository.js'

try {
  await inicializarCatalogo()
  console.log('Catálogo privado inicializado. Los arranques posteriores solo lo leen.')
} catch (error) {
  console.error(error.code === 'EEXIST'
    ? 'El catálogo ya existe; no se ha sobrescrito.'
    : `No se pudo inicializar el catálogo: ${error.message}`)
  process.exitCode = 1
}
