import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Strategic vendor chunking for better long-term caching & smaller initial bundle.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Order matters: check more specific packages first to avoid them being captured by generic 'react' substring.
            if (id.includes('@fluentui')) return 'fluentui';
            if (id.includes('@pa-client/power-code-sdk')) return 'power-sdk';
            if (/react-dom|node_modules\\react\\|node_modules\/react\//.test(id)) return 'react';
          }
        }
      }
    }
  }
});