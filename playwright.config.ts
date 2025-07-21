// playwright.config.ts
import { defineConfig } from '@playwright/test';
import path from 'path';

const fileName = process.env.TEST_FILE_NAME || 'test';
const safeFileName = fileName.replace(/[^\w\-]/g, '_');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  testDir: './tests',
  retries: 0,
  globalTimeout: 10 * 60 * 1000, // Entire test suite timeout
  use: {
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    outputDir: path.join('test-results', `${safeFileName}-${timestamp}`),
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  globalTeardown: require.resolve('./global-teardown'),
});
