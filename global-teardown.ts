import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { FullConfig } from '@playwright/test';

// Directory where test output files are stored
const artifactsDir = path.join('test-results');

// 🔍 Recursively find all .webm files
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

// 🎞️ Convert each .webm file to .mp4 in the same folder
function convertWebmToMp4(webmPath: string) {
  const mp4Path = webmPath.replace(/\.webm$/, '.mp4');

  console.log(`🎥 Converting: ${webmPath} → ${mp4Path}`);
  try {
    execSync(`ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 23 "${mp4Path}"`);
    console.log(`✅ Saved: ${mp4Path}`);
  } catch (err) {
    console.error(`❌ Failed to convert: ${webmPath}\n`, err);
  }
}

// Main teardown logic
export default async function globalTeardown(config: FullConfig) {
  const webmFiles = findWebmFiles(artifactsDir);

  if (webmFiles.length === 0) {
    console.log('⚠️ No .webm files found.');
    return;
  }

  for (const webm of webmFiles) {
    convertWebmToMp4(webm);
  }

  console.log('✅ All .webm videos converted to .mp4');
}
