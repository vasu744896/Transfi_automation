import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

test('Fetch valid crypto estimates only if value appears', async ({ page }) => {
  test.setTimeout(0); // ✅ Disable timeout for this test

  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  await page.waitForTimeout(2000);
  console.log('✅ Page loaded');

  // Step 1: Click "Sell Crypto"
  await page.getByRole('tab', { name: /sell crypto/i }).click();
  await page.waitForTimeout(2000);
  console.log('✅ Sell Crypto tab selected');

  // Step 2: Get dropdown and all coin list
  const cryptoDropdown = page.locator('.chakra-input__right-addon').nth(0);
  await cryptoDropdown.click();

  const cryptoList = page.locator('.chakra-modal__body div >> text=/\\(.*\\)/');
  const total = await cryptoList.count();
  console.log(`🔢 Total cryptos: ${total}`);

  const results: { Coin: string; EstimateStatus: string; EstimateValue: string }[] = [];

  for (let i = 0; i < total; i++) {
    const coin = cryptoList.nth(i);
    const coinText = await coin.innerText();

    try {
      await coin.click();
      await page.waitForTimeout(3000); // Wait for estimate to appear

      const estimateBox = page.locator('div.css-19vmn3i');
      const isVisible = await estimateBox.isVisible();

      if (isVisible) {
        const value = (await estimateBox.textContent())?.trim() || '';

        if (value && value !== 'You Get (Estimate)') {
          console.log(`✅ - ( ${coinText} ) → Estimate: ${value}`);
          results.push({ Coin: coinText, EstimateStatus: 'Success', EstimateValue: value });
        } else {
          console.log(`❌ - ( ${coinText} ) → Empty estimate`);
          results.push({ Coin: coinText, EstimateStatus: 'Empty', EstimateValue: '' });
        }
      } else {
        console.log(`❌ - ( ${coinText} ) → Estimate not visible`);
        results.push({ Coin: coinText, EstimateStatus: 'NotVisible', EstimateValue: '' });
      }
    } catch (err) {
      console.log(`❌ - ( ${coinText} ) → Error fetching estimate`);
      results.push({ Coin: coinText, EstimateStatus: 'Error', EstimateValue: '' });

      // Try to recover dropdown
      try {
        console.log('⚠️ Failed to reopen dropdown, reloading page...');
        await page.reload();
        await page.waitForTimeout(2000);
        await page.getByRole('tab', { name: /sell crypto/i }).click();
        await page.waitForTimeout(2000);
        await cryptoDropdown.click();
      } catch {
        console.log('❌ Reload failed: page.goto or browser was closed');
        break;
      }
    }

    if (i !== total - 1) {
      await page.waitForTimeout(1000);
      await cryptoDropdown.click();
    }
  }

  const worksheet = XLSX.utils.json_to_sheet(results);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estimates');
  XLSX.writeFile(workbook, 'final_crypto_estimates.xlsx');
  console.log('📁 Results saved to final_crypto_estimates.xlsx');
});
