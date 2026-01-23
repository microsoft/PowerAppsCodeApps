import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'vite',
      testMatch: 'vite.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173',
      },
    },
    {
      name: 'starter',
      testMatch: 'starter.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4174',
      },
    },
  ],
  webServer: [
    {
      name: 'vite-template',
      command: 'npm run build && npm run preview -- --port 4173',
      cwd: path.resolve(__dirname, '../templates/vite'),
      url: 'http://localhost:4173',
      reuseExistingServer: !isCI,
    },
    {
      name: 'starter-template',
      command: 'npm run build && npm run preview -- --port 4174',
      cwd: path.resolve(__dirname, '../templates/starter'),
      url: 'http://localhost:4174',
      reuseExistingServer: !isCI,
    },
  ],
});
