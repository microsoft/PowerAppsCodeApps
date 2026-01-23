import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'vite',
      testMatch: 'vite.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: isCI ? 'http://localhost:4173' : 'http://localhost:5173',
      },
    },
  ],
  webServer: [
    {
      name: 'vite-template',
      command: isCI ? 'npm run build && npm run preview' : 'npm run dev',
      cwd: path.resolve(__dirname, '../templates/vite'),
      url: isCI ? 'http://localhost:4173' : 'http://localhost:5173',
      reuseExistingServer: !isCI,
    },
  ],
});
