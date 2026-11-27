import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createDemoApi } from '../demo-server/demoApi.js'

// Demo only: serves /api/demo-data and /uploads from the JSON files in demo-server/data,
// so `npm run dev` and `npm run preview` save to the same files as the hosted demo.
const demoDataApi = {
  name: 'demo-data-api',
  configureServer(server) {
    server.middlewares.use(createDemoApi())
  },
  configurePreviewServer(server) {
    server.middlewares.use(createDemoApi())
  },
}

export default defineConfig({
  plugins: [vue(), demoDataApi],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
