import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), powerApps()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
