import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Test result folder (relative or absolute)
const testFolder = 'test-results/happyend-loginwork _and_negative-test';
const outputFile = path.join(testFolder, 'trace_like_video_1.mp4');
const mergeListFile = path.join(testFolder, 'merge_list.txt');

// Order-sensitive filenames
const mergeOrder = ['video.webm', 'video-1.webm', 'video-2.webm'];

// Step 1: Build full paths to files (validate existence)
const validVideoPaths: string[] = [];
for (const name of mergeOrder) {
  const full = path.resolve(path.join(testFolder, name));
  if (fs.existsSync(full)) {
    validVideoPaths.push(full);
  } else {
    console.warn(`⚠️  Missing: ${full}`);
  }
}

// Step 2: Write merge list
if (validVideoPaths.length === 0) {
  console.error('❌ No valid video files found.');
  process.exit(1);
}

const mergeListContent = validVideoPaths.map(f => `file '${f}'`).join('\n');
fs.writeFileSync(mergeListFile, mergeListContent);

// Step 3: Merge using ffmpeg with proper re-encoding
console.log(`🎬 Merging ${validVideoPaths.length} videos into ${outputFile}...`);
try {
  execSync(`ffmpeg -f concat -safe 0 -i "${mergeListFile}" -c:v libx264 -preset veryfast -crf 23 "${outputFile}"`, {
    stdio: 'inherit',
  });
  console.log(`✅ Final video saved: ${outputFile}`);
} catch (err) {
  console.error('❌ ffmpeg merge failed.', err);
}

fs.unlinkSync(mergeListFile);
