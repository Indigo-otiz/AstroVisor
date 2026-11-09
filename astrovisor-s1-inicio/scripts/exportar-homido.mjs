import { exportarHomido } from '../backend/src/services/homidoExport.js'
if(typeof process.loadEnvFile==='function')try{process.loadEnvFile()}catch{}
if(process.argv.length!==2){console.error('No se aceptan argumentos. Configura las rutas mediante variables privadas del servidor.');process.exitCode=1}
else try {
  const r=await exportarHomido()
  console.log(JSON.stringify(r))
  if(r.limpiezaPendiente){console.error('PUBLICACIÓN CONFIRMADA. Limpieza pendiente: un bloqueo puede impedir nuevas exportaciones. No repitas automáticamente la operación.');process.exitCode=2}
  if(r.durabilidadPendiente)console.error('Publicación confirmada; sincronización de directorios no acreditada en este sistema. No equivale a durabilidad ante corte eléctrico.')
}catch(e){console.error(JSON.stringify({confirmada:false,codigo:['EACCES','EPERM','ENOSPC','EIO','ENOENT'].includes(e.code)?e.code:'EXPORTACION_RECHAZADA',limpiezaPendiente:!!e.limpiezaPendiente}));console.error('No se confirmó la publicación. Revisa configuración, integridad, revisión y bloqueo; el catálogo administrativo no se reescribe.');process.exitCode=1}
