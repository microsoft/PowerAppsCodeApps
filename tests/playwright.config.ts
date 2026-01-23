import { defineConfig, devices } from "@playwright/test";
import path from "path";

const isCI = !!process.env.CI;
if (!process.env.TEMPLATE) {
  throw new Error("TEMPLATE environment variable is not set to template.");
}
const template = process.env.TEMPLATE as "vite" | "starter"; // Set to 'vite' or 'starter' to run only one

const webServers = {
  vite: {
    name: "vite-template",
    command: "npm run build && npm run preview -- --port 4173",
    cwd: path.resolve(__dirname, "../templates/vite"),
    url: "http://localhost:4173",
    reuseExistingServer: !isCI,
  },
  starter: {
    name: "starter-template",
    command: "npm run build && npm run preview -- --port 4174",
    cwd: path.resolve(__dirname, "../templates/starter"),
    url: "http://localhost:4174",
    reuseExistingServer: !isCI,
  },
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "vite",
      testMatch: "vite.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:4173",
      },
    },
    {
      name: "starter",
      testMatch: "starter.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:4174",
      },
    },
  ],
  webServer: webServers[template],
});
