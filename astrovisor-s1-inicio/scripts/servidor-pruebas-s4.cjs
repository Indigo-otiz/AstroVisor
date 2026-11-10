// Build y API reales para scripts de QA. Los procesos se cierran al terminar.
const { spawn } = require('node:child_process')
const path = require('node:path')
module.exports = async function servirS4() {
  const root = path.resolve(__dirname, '..')
  const api = spawn(process.execPath, ['backend/src/index.js'], {
    cwd: root, env: { ...process.env, PORT:'3094' }, stdio:'ignore', windowsHide:true,
  })
  let web
  try {
    const { preview } = await import('vite')
    web = await preview({ root:path.join(root,'frontend'), configFile:path.join(root,'frontend/vite.config.js'),
      preview:{ host:'127.0.0.1',port:5194,strictPort:true,proxy:{'/api':'http://127.0.0.1:3094'} } })
    for (let i=0;i<30;i++) {
      try {
        const r=await fetch('http://127.0.0.1:5194/api/health'); await r.text()
        if(r.ok) return async()=>{ api.kill();web.httpServer.closeAllConnections();await new Promise(r=>web.httpServer.close(r)) }
      } catch {}
      await new Promise(r=>setTimeout(r,100))
    }
    throw new Error('API local S4 no disponible')
  } catch(e) { web?.httpServer.close();api.kill();throw e }
}
