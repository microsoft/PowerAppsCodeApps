import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { powerApps, POWER_APPS_CORS_ORIGINS } from './plugins/plugin-power-apps';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    powerApps()
  ],
  base: "./",
  server: {
    cors: {
      origin: POWER_APPS_CORS_ORIGINS
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
