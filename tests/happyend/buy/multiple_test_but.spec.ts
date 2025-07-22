import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import fs from 'fs';

test.setTimeout(24 * 60 * 60 * 1000); 

test('Loop through each currency and crypto with summary check (auto-save)', async ({ page }) => {
  const results: { currency: string; crypto: string; summary: string }[] = [];
  const filePath = 'buy_crypto.xlsx';

  const saveToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, filePath);
    console.log(`Auto-saved to ${filePath}`);
  };

  try {
    await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');

    const dropdowns = page.locator('.chakra-input__right-addon');

    await dropdowns.first().click(); 
    await page.getByText('All').click();
    await page.waitForTimeout(1000);
    const currencyOptions = page.locator('.css-a82vg0');
    await currencyOptions.first().waitFor();
    const currencyCount = await currencyOptions.count();
    console.log(`💰 Total currencies: ${currencyCount}`);
    await page.getByRole('button', { name: 'Close' }).click();

    for (let i = 0; i < currencyCount; i++) {
      await page.keyboard.press('Escape');
      await dropdowns.first().click();
      await page.waitForTimeout(1000);

      const freshCurrencies = page.locator('.css-a82vg0');
      const currencyOption = freshCurrencies.nth(i);
      const currencyName = (await currencyOption.textContent())?.trim() || `Currency ${i}`;

      try {
        await currencyOption.click({ timeout: 2000 });
        console.log(`💱 Selected currency: ${currencyName}`);
      } catch {
        console.log(`❌ Failed to select currency: ${currencyName}`);
        continue;
      }

      await page.waitForTimeout(1000);

      await dropdowns.nth(1).click(); 
      await page.waitForTimeout(1000);

      const cryptoOptions = page.locator('.css-a82vg0');
      await cryptoOptions.first().waitFor();
      const cryptoCount = await cryptoOptions.count();
      console.log(`🪙 Total cryptos for ${currencyName}: ${cryptoCount}`);

      for (let j = 0; j < cryptoCount; j++) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await dropdowns.nth(1).click();
        await page.waitForTimeout(800);

        const freshCryptos = page.locator('.css-a82vg0');
        const cryptoOption = freshCryptos.nth(j);
        const cryptoName = (await cryptoOption.textContent())?.trim() || `Crypto ${j}`;

        try {
          await cryptoOption.click({ timeout: 2000 });
          console.log(`✅ Selected crypto: ${cryptoName}`);
          await page.waitForTimeout(1500);

          const summaryBox = page.locator('.css-19vmn3i');
          const isVisible = await summaryBox.isVisible();

          if (isVisible) {
            const summaryText = (await summaryBox.textContent())?.trim() || 'No summary text';
            console.log(`📊 Summary for ${currencyName} + ${cryptoName}: ${summaryText}`);
            results.push({ currency: currencyName, crypto: cryptoName, summary: summaryText });
          } else {
            console.log(`❌ No summary for ${currencyName} + ${cryptoName}`);
            results.push({ currency: currencyName, crypto: cryptoName, summary: 'No summary' });
          }
        } catch {
          console.log(`❌ Failed crypto: ${cryptoName}`);
          results.push({ currency: currencyName, crypto: cryptoName, summary: 'Error' });
        }

      
        saveToExcel();
        await page.waitForTimeout(1000);
      }

      console.log(`✅ Finished all cryptos for: ${currencyName}`);
    }

    console.log('🎉 Finished all currencies and cryptos');
  } finally {

    
    saveToExcel();
    console.log('✅ Final save complete');
  }
});
