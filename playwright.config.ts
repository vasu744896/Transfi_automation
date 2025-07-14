import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  use: {
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  globalTeardown: './global-teardown.ts', // 👈 Add this line
});
