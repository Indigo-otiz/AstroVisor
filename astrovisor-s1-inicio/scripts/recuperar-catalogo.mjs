import { restaurarCatalogo, retirarBloqueoAbandonado } from '../backend/src/services/documentRepository.js'

try {
  const [accion, respaldo, revision, ...extra] = process.argv.slice(2)
  if (accion === 'retirar-bloqueo' && respaldo === undefined) {
    await retirarBloqueoAbandonado()
    console.log('Bloqueo abandonado retirado tras comprobar ausencia del proceso local.')
  } else if (accion === 'restaurar' && respaldo && /^[1-9][0-9]*$/.test(revision ?? '') && extra.length === 0) {
    const resultado = await restaurarCatalogo({ respaldo, ultimaRevision: Number(revision) })
    console.log(`Restauración confirmada en revisión ${resultado.revisionPersistida}.`)
    if (resultado.durabilidadPendiente) console.log('Sincronización de directorio pendiente de validación operativa.')
    if (resultado.limpiezaPendiente) {
      console.error(`El catálogo YA fue restaurado. NO repitas automáticamente la restauración. Limpieza del bloqueo pendiente (${resultado.codigoLimpieza}); puede impedir nuevas escrituras. Requiere intervención con la API detenida y comprobación del propietario del bloqueo.`)
      process.exitCode = 2
    }
  } else throw new Error('Argumentos inválidos')
} catch (error) {
  console.error(error.confirmada === false
    ? `No se completó la recuperación: restauración NO confirmada (${error.code ?? 'DATOS_INVALIDOS'}); el catálogo no fue reemplazado.`
    : 'No se completó la recuperación. Detén la API y revisa bloqueo, respaldo y última revisión; consulta el procedimiento operativo.')
  if (error.limpiezaPendiente) console.error(`Limpieza del bloqueo pendiente (${error.codigoLimpieza}); puede impedir nuevas escrituras. Requiere intervención con la API detenida y comprobación del propietario del bloqueo.`)
  process.exitCode = 1
}
