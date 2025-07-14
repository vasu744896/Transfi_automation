import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { FullConfig } from '@playwright/test';

const resultsDir = './test-results';
const mergeListFile = 'merge_list.txt';

// Get next available video filename
function getNextVideoFilename(base: string, ext: string, dir: string): string {
  let i = 1;
  let filename = `${base}_${i}.${ext}`;
  while (fs.existsSync(path.join(dir, filename))) {
    i++;
    filename = `${base}_${i}.${ext}`;
  }
  return path.join(dir, filename);
}

// Find all .webm files in test-results, with full path + stats
function findAndSortWebmFiles(dir: string): string[] {
  const files: { file: string; time: number }[] = [];

  function walk(folder: string) {
    const items = fs.readdirSync(folder);
    for (const item of items) {
      const fullPath = path.join(folder, item);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.webm')) {
        files.push({ file: fullPath, time: stats.birthtimeMs || stats.ctimeMs });
      }
    }
  }

  walk(dir);

  // Sort by file creation time (or ctime fallback)
  return files
    .sort((a, b) => a.time - b.time)
    .map(f => f.file);
}

// Create merge_list.txt for ffmpeg
function createMergeListFile(files: string[]) {
  const content = files.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(mergeListFile, content);
}

// Merge all videos
function mergeVideos() {
  const webmFiles = findAndSortWebmFiles(resultsDir);

  if (webmFiles.length === 0) {
    console.log('❌ No video files found to merge.');
    return;
  }

  console.log('🛠 Creating video merge list (sorted by time)...');
  createMergeListFile(webmFiles);

  const finalOutput = getNextVideoFilename('final_test_video', 'mp4', resultsDir);

  console.log(`🎬 Merging ${webmFiles.length} videos into ${finalOutput}...`);
  execSync(`ffmpeg -f concat -safe 0 -i ${mergeListFile} -c:v libx264 -preset fast -crf 23 "${finalOutput}"`);

  fs.unlinkSync(mergeListFile);

  console.log(`✅ Final merged video saved to: ${finalOutput}`);
}

// Playwright will call this
export default async function globalTeardown(config: FullConfig) {
  mergeVideos();
}
