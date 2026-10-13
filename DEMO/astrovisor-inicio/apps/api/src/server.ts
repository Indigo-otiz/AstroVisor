import { app } from './app.js';

const server = app.listen(3001, '127.0.0.1', () => {
  console.log('AstroVisor API: http://127.0.0.1:3001');
});
server.on('error', error => { console.error('No se pudo iniciar la API:', error.message); process.exitCode = 1; });
