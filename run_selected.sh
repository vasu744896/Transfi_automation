#!/bin/bash

echo "🚀 Running selected Playwright tests..."

# Exit on error
set -e

# Define the root test directory
TEST_DIR="./tests"

# List of SPECIFIC test files to run — UPDATE these paths as needed
TEST_FILES=(
  "$TEST_DIR/happyend/login/login_work _and_negative.spec.ts"
  "$TEST_DIR/happyend/sell/sell_crypto.spec.ts"
  "$TEST_DIR/happyend/login/login_work _and_negative.spec.ts"
  "$TEST_DIR/happyend/buy/buy_btc.spec.ts"
)

# Loop through and run each test
for test_file in "${TEST_FILES[@]}"
do
  echo "🔍 Running: $test_file"
  npx playwright test "$test_file"
done

echo "✅ All selected tests completed."
