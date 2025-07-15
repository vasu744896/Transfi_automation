// playwright.config.ts
import { defineConfig } from '@playwright/test';
import path from 'path';

// Use filename from environment or default
const fileName = process.env.TEST_FILE_NAME || 'test';

// Use timestamp to avoid overwrite
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  testDir: './tests',
  retries: 0,
  use: {
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    outputDir: path.join('test-results', `${fileName}-${timestamp}`), // ✅ Unique dir per file
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  globalTeardown: require.resolve('./global-teardown'),
});
