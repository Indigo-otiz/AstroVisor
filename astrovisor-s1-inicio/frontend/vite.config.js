import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const origen = process.env.ASTROVISOR_EXPORT_ORIGIN
if (origen) {
  const url = new URL(origen)
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('ASTROVISOR_EXPORT_ORIGIN debe ser un origen HTTP local')
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3001',
      ...(origen ? { '/respaldo-homido': { target: origen, rewrite: ruta => ruta.replace(/^\/respaldo-homido/, '') } } : {}),
    },
  },
})
