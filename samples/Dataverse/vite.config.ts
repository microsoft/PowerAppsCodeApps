import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { powerApps } from "./plugins/powerApps";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), powerApps()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
