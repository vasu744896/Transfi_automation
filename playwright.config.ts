import { defineConfig } from '@playwright/test';
import path from 'path';

const fileName = process.env.TEST_FILE_NAME || 'test';
const safeFileName = fileName.replace(/[^\w\-]/g, '_');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  testDir: './tests',
  retries: 0,
  use: {
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    outputDir: path.join('test-results', `${safeFileName}-${timestamp}`),
  },
  projects: [
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        headless: true, // ✅ updated
      },
    },
  ],
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  //globalTeardown: require.resolve('./global-teardown'),
});
  