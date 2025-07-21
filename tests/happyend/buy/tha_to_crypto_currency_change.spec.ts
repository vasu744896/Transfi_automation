// tests/crypto-summary.spec.ts
import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import fs from 'fs';

test('Click each cryptocurrency and save summary to Excel', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');

  // ✅ Select Thailand (THB) currency
  await page.getByRole('group').filter({ hasText: 'I want to Pay' }).locator('svg').click();
  await page.locator('div').filter({ hasText: /^Thailand-THB$/ }).first().click();

  // ✅ Open Crypto dropdown
  const dropdowns = page.locator('.chakra-input__right-addon');
  const cryptoDropdown = dropdowns.nth(1);
  await cryptoDropdown.click();

  const cryptoList = page.locator('.chakra-modal__body div >> text=/\\(.*\\)/');
  const total = await cryptoList.count();
  console.log(`✅ Found ${total} cryptos`);

  const results: { Coin: string; Status: string; Summary: string }[] = [];
  const batchSize = 20;

  for (let start = 0; start < total; start += batchSize) {
    const end = Math.min(start + batchSize, total);
    console.log(`Processing coins ${start + 1} to ${end}`);

    for (let i = start; i < end; i++) {
      const coin = cryptoList.nth(i);
      await coin.scrollIntoViewIfNeeded();
      const coinText = await coin.innerText();

      try {
        await coin.click();
        await page.waitForTimeout(1500);

        const summaryLocator = page.locator('.chakra-accordion__button.css-jr6ypq');
        await expect(summaryLocator).toBeVisible({ timeout: 5000 });

        const summary = await summaryLocator.innerText();
        const trimmedSummary = summary.trim();

        results.push({
          Coin: coinText,
          Status: trimmedSummary ? 'Success' : 'Empty Summary',
          Summary: trimmedSummary || '',
        });

        console.log(`✅ ${coinText} → Summary updated: ${trimmedSummary}`);
      } catch {
        results.push({
          Coin: coinText,
          Status: 'Error',
          Summary: '',
        });
        console.log(`❌ ${coinText} → Summary not visible or error`);
      }

      if (i !== end - 1) {
        try {
          await page.waitForTimeout(500);
          await expect(cryptoDropdown).toBeVisible({ timeout: 7000 });
          await cryptoDropdown.click();
        } catch (e) {
          console.log(`⚠️ Failed to reopen dropdown on coin ${coinText}: ${e}`);
          return;
        }
      }
    }

    if (end < total) {
      console.log('Reloading page to avoid memory issues...');
      await page.reload();

      // 🔁 Re-select "Thailand - THB" after reload
      await page.getByRole('group').filter({ hasText: 'I want to Pay' }).locator('svg').click();
      await page.locator('div').filter({ hasText: /^Thailand-THB$/ }).first().click();

      await dropdowns.nth(1).click();
    }
  }

  // ✅ Save to Excel
  const worksheet = XLSX.utils.json_to_sheet(results);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CryptoSummary');
  XLSX.writeFile(workbook, 'crypto_summary.xlsx');

  console.log('📁 Results saved to crypto_summary.xlsx');
}, { timeout: 600000 });