import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB to suppress the warning
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          // Combine Fluent UI packages to avoid circular dependencies
          'fluent-ui': ['@fluentui/react-components', '@fluentui/react-icons', '@fluentui/tokens'],
        }
      }
    }
  },
});
