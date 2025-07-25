#!/bin/bash
cd /root/Transfi_automation/Transfi_automation || exit

# Run the sell test using npx
/usr/bin/npx playwright test ./tests/happyend/sell/multiple_test_sell.spec.ts
