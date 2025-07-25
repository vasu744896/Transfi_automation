#!/bin/bash
cd /root/Transfi_automation/Transfi_automation || exit

# Use npx full path or local playwright binary
/usr/bin/npx playwright test ./tests/happyend/buy/multiple_test_buy.spec.ts
