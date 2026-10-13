import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), powerApps()],
  server: {  port: 3000,
    proxy: {
      // Proxy /api/releaseplans/* → https://releaseplans.microsoft.com/en-US/allreleaseplans/*
      // This avoids browser CORS restrictions when developing locally.
      '/api/releaseplans': {
        target: 'https://releaseplans.microsoft.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/releaseplans/, '/en-US/allreleaseplans'),
      },
    },
  },
});
