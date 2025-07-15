import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { FullConfig } from '@playwright/test';

const artifactsDir = path.join('test-results'); // or 'playwright-report' if you're saving there

function findWebmFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findWebmFiles(fullPath));
    } else if (entry.name.endsWith('.webm')) {
      results.push(fullPath);
    }
  }

  return results;
}

function convertWebmToMp4(webmPath: string) {
  const mp4Path = webmPath.replace(/\.webm$/, '.mp4');
  console.log(`🎥 Converting: ${webmPath} → ${mp4Path}`);
  execSync(`ffmpeg -i "${webmPath}" -c:v libx264 -preset fast -crf 23 "${mp4Path}"`);
}

export default async function globalTeardown(config: FullConfig) {
  const webmFiles = findWebmFiles(artifactsDir);
  if (webmFiles.length === 0) {
    console.log('⚠️ No .webm files found.');
    return;
  }

  for (const webm of webmFiles) {
    convertWebmToMp4(webm);
  }

  console.log('✅ All videos converted to .mp4');
}
