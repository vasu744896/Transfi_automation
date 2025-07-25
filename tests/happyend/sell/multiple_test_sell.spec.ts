import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.setTimeout(24 * 60 * 60 * 1000); // 24 hours timeout

test('Loop through currencies and cryptos, save CSV (overwrite, no header)', async ({ page }) => {
  const results: { Currency: string; Coin: string; EstimateStatus: string; EstimateValue: string }[] = [];
  const dir = 'csv-exports';
  const filePath = path.join(dir, 'sell.csv');

  // Ensure folder exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Overwrite file at start (empty file, no header)
  fs.writeFileSync(filePath, '');

  const saveToCSV = () => {
    const rows = results.map(r =>
      `${r.Currency},${r.Coin},${r.EstimateStatus},${r.EstimateValue}`
    );
    fs.appendFileSync(filePath, rows.join('\n') + '\n');
    results.length = 0; // Clear after saving
    console.log(`💾 Data saved (overwrite mode) to ${filePath}`);
  };

  try {
    await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');

    await page.getByRole('tab', { name: /sell crypto/i }).click();
    await page.waitForTimeout(2000);
    console.log('✅ Sell Crypto tab selected');

    const dropdowns = page.locator('.chakra-input__right-addon');
    const currencyDropdown = dropdowns.nth(1);
    const cryptoDropdown = dropdowns.nth(0);

    await currencyDropdown.click();
    const currencyOptions = page.locator('.css-a82vg0');
    await currencyOptions.first().waitFor();
    const currencyCount = await currencyOptions.count();
    await page.keyboard.press('Escape');
    console.log(`💰 Total currencies: ${currencyCount}`);

    for (let i = 0; i < currencyCount; i++) {
      const dropdowns = page.locator('.chakra-input__right-addon');
      const currencyDropdown = dropdowns.nth(1);
      const cryptoDropdown = dropdowns.nth(0);

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
        results.push({ Currency: currencyName, Coin: '-', EstimateStatus: 'CurrencySelectError', EstimateValue: '' });
        saveToCSV();
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
          const coinText = (await coin.textContent())?.trim() || `Coin ${j}`;

          try {
            await coin.click();
            await page.waitForTimeout(3000);

            const estimateBox = page.locator('div.css-19vmn3i');
            const isVisible = await estimateBox.isVisible();

            if (isVisible) {
              const value = (await estimateBox.textContent())?.trim() || '';
              if (value && value !== 'You Get (Estimate)' && value.toLowerCase() !== 'loading...') {
                console.log(`✅ - (${coinText}) → Estimate: ${value}`);
                results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'Success', EstimateValue: value });
              } else {
                console.log(`❌ - (${coinText}) → Empty estimate`);
                results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'Empty', EstimateValue: '' });
              }
            } else {
              console.log(`🚫 - (${coinText}) → Estimate not visible`);
              results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'NotVisible', EstimateValue: '' });
            }
          } catch {
            console.log(`⛔ - (${coinText}) → Error clicking or loading`);
            results.push({ Currency: currencyName, Coin: coinText, EstimateStatus: 'Error', EstimateValue: '' });

            try {
              console.log('🔄 Reloading page to recover...');
              await page.reload();
              await page.waitForTimeout(2000);
              await page.getByRole('tab', { name: /sell crypto/i }).click();
              await page.waitForTimeout(2000);
              const dropdowns = page.locator('.chakra-input__right-addon');
              const currencyDropdown = dropdowns.nth(1);
              await currencyDropdown.click();
              const currencyList = page.locator('.css-a82vg0');
              await currencyList.nth(i).click();
              await page.waitForTimeout(1000);
              const cryptoDropdown = dropdowns.nth(0);
              await cryptoDropdown.click();
            } catch {
              console.log('❌ Hard failure, exiting crypto loop...');
              break;
            }
          }

          saveToCSV();

          if (j !== total - 1) {
            await page.waitForTimeout(1000);
            await cryptoDropdown.click();
          }
        }
      } catch {
        console.log(`❌ Could not process cryptos for ${currencyName}`);
        results.push({ Currency: currencyName, Coin: '-', EstimateStatus: 'CryptoListError', EstimateValue: '' });
        saveToCSV();
      }

      console.log(`✅ Finished crypto loop for: ${currencyName}`);
    }

    console.log('🎉 All currencies processed');
  } finally {
    saveToCSV();
    console.log('✅ Final CSV save complete');
  }
});
