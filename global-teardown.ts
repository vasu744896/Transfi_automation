import type { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  const resultsDir = './test-results';

  function convertVideos(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        convertVideos(fullPath);
      } else if (item.endsWith('.webm')) {
        const mp4Path = fullPath.replace('.webm', '.mp4');
        try {
          console.log(`🎬 Converting ${item} to mp4...`);
          execSync(`ffmpeg -y -i "${fullPath}" -c:v libx264 "${mp4Path}"`);
          fs.unlinkSync(fullPath); // Remove this line if you want to keep .webm
          console.log(`✅ Saved: ${mp4Path}`);
        } catch (error) {
          console.error(`❌ Failed to convert ${item}:`, error);
        }
      }
    }
  }

  convertVideos(resultsDir);
}

export default globalTeardown;
