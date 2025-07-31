#!/bin/bash

# Check if running in GitHub Actions
if [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "✅ Running inside GitHub Actions"
  # Already in repo directory – no cd needed
else
  echo "✅ Running locally"
  cd /root/Transfi_automation/Transfi_automation || exit
fi

# Run the test (use relative path)
npx playwright test tests/happyend/buy/multiple_test_buy.spec.ts
