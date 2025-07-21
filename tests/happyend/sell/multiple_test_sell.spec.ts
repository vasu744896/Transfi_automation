import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

test.setTimeout(24 * 60 * 60 * 1000); // ⏱️ 24 hours

test('Loop through each currency and crypto on Sell tab and store results', async ({ page }) => {
  const results: { Currency: string; Coin: string; EstimateStatus: string; EstimateValue: string }[] = [];
  const filePath = 'sell.xlsx';

  const saveToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estimates');
    XLSX.writeFile(workbook, filePath);
    console.log(`💾 Auto-saved to ${filePath}`);
  };

  try {
    await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');

    // Select Sell Crypto tab
    await page.getByRole('tab', { name: /sell crypto/i }).click();
    await page.waitForTimeout(2000);
    console.log('✅ Sell Crypto tab selected');

    const dropdowns = page.locator('.chakra-input__right-addon');
    const currencyDropdown = dropdowns.nth(1); // Currency selector
    const cryptoDropdown = dropdowns.nth(0);   // Coin selector

    // Get total currencies
    await currencyDropdown.click();
    const currencyOptions = page.locator('.css-a82vg0');
    await currencyOptions.first().waitFor();
    const currencyCount = await currencyOptions.count();
    await page.keyboard.press('Escape');
    console.log(`💰 Total currencies: ${currencyCount}`);

    for (let i = 0; i < currencyCount; i++) {
      await currencyDropdown.click();
      await page.waitForTimeout(1000);

      const currencyList = page.locator('.css-a82vg0');
      const currencyOption = currencyList.nth(i);
      const currencyName = (await currencyOption.textContent())?.trim() || `Currency ${i}`;

      try {
        await currencyOption.click({ timeout: 2000 });
        console.log(`💱 Selected currency: ${currencyName}`);
      } catch {
        console.log(`❌ Failed to select currency: ${currencyName}`);
        continue;
      }

      await page.waitForTimeout(1000);

      try {
        await cryptoDropdown.click();
        const cryptoList = page.locator('.chakra-modal__body div >> text=/\\(.*\\)/');
        const total = await cryptoList.count();
        console.log(`🪙 Total cryptos for ${currencyName}: ${total}`);

        for (let j = 0; j < total; j++) {
          const coin = cryptoList.nth(j);
          const coinText = await coin.textContent() || `Coin ${j}`;

          try {
            await coin.click();
            await page.waitForTimeout(3000);

            const estimateBox = page.locator('div.css-19vmn3i');
            const isVisible = await estimateBox.isVisible();

            if (isVisible) {
              const value = (await estimateBox.textContent())?.trim() || '';
              if (value && value !== 'You Get (Estimate)') {
                console.log(`✅ - ( ${coinText} ) → Estimate: ${value}`);
                results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'Success', EstimateValue: value });
              } else {
                console.log(`❌ - ( ${coinText} ) → Empty estimate`);
                results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'Empty', EstimateValue: '' });
              }
            } else {
              console.log(`🚫 - ( ${coinText} ) → Estimate not visible`);
              results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'NotVisible', EstimateValue: '' });
            }
          } catch (err) {
            console.log(`⛔ - ( ${coinText} ) → Error clicking or loading`);
            results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'Error', EstimateValue: '' });

            // Recovery strategy
            try {
              console.log('🔄 Reloading page to recover...');
              await page.reload();
              await page.waitForTimeout(2000);
              await page.getByRole('tab', { name: /sell crypto/i }).click();
              await page.waitForTimeout(2000);
              await currencyDropdown.click();
              await currencyList.nth(i).click(); // Reselect current currency
              await page.waitForTimeout(1000);
              await cryptoDropdown.click();
            } catch {
              console.log('❌ Hard failure, exiting...');
              break;
            }
          }

          // Save after each crypto
          saveToExcel();

          if (j !== total - 1) {
            await page.waitForTimeout(1000);
            await cryptoDropdown.click();
          }
        }
      } catch {
        console.log(`❌ Could not process cryptos for ${currencyName}`);
      }

      console.log(`✅ Finished crypto loop for: ${currencyName}`);
    }

    console.log('🎉 All currencies processed');
  } finally {
    // Final guaranteed save
    saveToExcel();
    console.log('✅ Final save complete');
  }
});
