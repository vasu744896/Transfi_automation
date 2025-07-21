import { test, expect } from '@playwright/test';

timeout: 24 * 60 * 60 * 1000,

test('Loop through each currency and crypto with summary check', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  await page.waitForTimeout(2000);
  console.log('✅ Page loaded');

  const dropdowns = page.locator('.chakra-input__right-addon');

  // 🔁 Get all currencies
  await dropdowns.first().click(); // "Pay With"
  await page.getByText('All').click();
  await page.waitForTimeout(1000);
  const currencyOptions = page.locator('.css-a82vg0');
  await currencyOptions.first().waitFor();
  const currencyCount = await currencyOptions.count();
  console.log(`💰 Total currencies: ${currencyCount}`);
  await page.getByRole('button', { name: 'Close' }).click();

  // 🔁 Loop through each currency
  for (let i = 0; i < currencyCount; i++) {
    // Step 1: Select currency
    await page.keyboard.press('Escape');
    await dropdowns.first().click(); // Open again
    await page.waitForTimeout(1000);

    const freshCurrencies = page.locator('.css-a82vg0');
    const currencyOption = freshCurrencies.nth(i);
    const currencyName = await currencyOption.textContent();

    try {
      await currencyOption.click({ timeout: 2000 });
      console.log(`💱 Selected currency: ${currencyName?.trim()}`);
    } catch (err) {
      console.log(`❌ Failed to select currency: ${currencyName?.trim()}`);
      continue; // Skip to next currency
    }

    await page.waitForTimeout(1000);

    // 🔁 Get and loop all cryptos
    await dropdowns.nth(1).click(); // "Receive" dropdown
    await page.waitForTimeout(1000);

    const cryptoOptions = page.locator('.css-a82vg0');
    await cryptoOptions.first().waitFor();
    const cryptoCount = await cryptoOptions.count();
    console.log(`🪙 Total cryptos for ${currencyName?.trim()}: ${cryptoCount}`);

    for (let j = 0; j < cryptoCount; j++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await dropdowns.nth(1).click();
      await page.waitForTimeout(800);

      const freshCryptos = page.locator('.css-a82vg0');
      const cryptoOption = freshCryptos.nth(j);
      const cryptoName = await cryptoOption.textContent();

      try {
        await cryptoOption.click({ timeout: 2000 });
        console.log(`✅ Selected crypto: ${cryptoName?.trim()}`);
        await page.waitForTimeout(1500);

        // 🔍 Summary check
        const summaryBox = page.locator('.css-19vmn3i');
        const isVisible = await summaryBox.isVisible();

        if (isVisible) {
          const summaryText = await summaryBox.textContent();
          console.log(`📊 Summary for ${currencyName?.trim()} + ${cryptoName?.trim()}: ${summaryText?.trim()}`);
        } else {
          console.log(`❌ No summary for ${currencyName?.trim()} + ${cryptoName?.trim()}`);
        }
      } catch (err) {
        console.log(`❌ Failed crypto: ${cryptoName?.trim()}`);
      }

      await page.waitForTimeout(1000);
    }

    console.log(`✅ Finished all cryptos for: ${currencyName?.trim()}`);
  }

  console.log('🎉 Finished all currencies and cryptos');
});
