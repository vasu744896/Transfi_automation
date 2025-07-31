#!/bin/bash

echo "🔁 Starting all Playwright tests..."
echo "📁 Test folders structure:"
find . -type d -name "tests*" -print

# Optional: clean previous test results
rm -rf test-results/ playwright-report/ || true

# Run all Playwright tests
npx playwright test

# Optional: Convert all .webm to .mp4 if ffmpeg is installed
echo "🎥 Converting .webm videos to .mp4..."
find test-results -name '*.webm' | while read file; do
  mp4_file="${file%.webm}.mp4"
  if command -v ffmpeg > /dev/null; then
    ffmpeg -i "$file" -c:v libx264 -preset fast -crf 23 "$mp4_file"
    echo "✅ Converted: $file -> $mp4_file"
  else
    echo "❌ ffmpeg not found, skipping: $file"
  fi
done

echo "✅ All Playwright tests completed."
