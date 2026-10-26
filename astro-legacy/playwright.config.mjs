import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
  (process.platform === 'win32' && existsSync(chrome) ? chrome : undefined);
const chromium = executablePath ? { launchOptions: { executablePath } } : {};

export default defineConfig({
  testDir: './tests/ui',
  timeout: 45000,
  expect: { timeout: 8000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}',
  updateSnapshots: 'missing',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.UI_BASE_URL || 'http://127.0.0.1:4330',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...chromium, viewport: { width: 1440, height: 1000 }, colorScheme: 'light' } },
    { name: 'mobile', use: { ...chromium, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'light' } },
    { name: 'dark', use: { ...chromium, viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 1000 }, colorScheme: 'light' } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'], colorScheme: 'light' } },
  ],
  webServer: {
    command: '"' + process.execPath + '" node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4330',
    url: 'http://127.0.0.1:4330',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
