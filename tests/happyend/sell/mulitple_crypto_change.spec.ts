import { test, expect } from '@playwright/test';

test('Loop through all currencies for BTC and get summary estimate', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  await page.waitForTimeout(1500);
  console.log('✅ Page loaded');

  // Select "Sell Crypto" tab
  await page.getByRole('tab', { name: /sell crypto/i }).click();
  await page.waitForTimeout(1000);

  const dropdowns = page.locator('.chakra-input__right-addon');

  // ✅ Select crypto (BTC) from first dropdown [index 0]
  const cryptoDropdown = dropdowns.nth(0);
  await cryptoDropdown.click();
  await page.waitForSelector('.chakra-modal__body');
  await page.getByRole('heading', { name: 'BTC' }).click();
  await page.waitForSelector('.chakra-modal__body', { state: 'detached' });
  await page.waitForTimeout(1000);
  console.log('✅ BTC selected');

  // 🔁 Loop through all output currencies in second dropdown [index 1]
  const currencyDropdown = dropdowns.nth(0);
  await currencyDropdown.click();
  await page.waitForSelector('.chakra-modal__body');
  await page.waitForTimeout(1000);

  // ✅ Currency options are buttons with headings (h2)
  const currencyOptions = page.locator('.chakra-modal__body [role="button"]:has(h2)');
  const total = await currencyOptions.count();
  console.log(`🔢 Total currencies found: ${total}`);

  if (total === 0) {
    console.log('❌ No currencies found');
    return;
  }

  for (let i = 0; i < total; i++) {
    const option = currencyOptions.nth(i);
    const currencyName = (await option.locator('h2').textContent())?.trim() ?? `Currency ${i + 1}`;

    await option.scrollIntoViewIfNeeded();
    await option.click({ force: true });

    await page.waitForSelector('.chakra-modal__body', { state: 'detached' });
    await page.waitForTimeout(1500); // wait for summary to load

    const summaryText = await page.locator('text=You get ~').first().textContent();
    console.log(`✅ Estimate for ${currencyName}: ${summaryText?.trim()}`);

    // Re-open the currency dropdown for next item
    if (i < total - 1) {
      await currencyDropdown.click();
      await page.waitForSelector('.chakra-modal__body');
      await page.waitForTimeout(1000);
    }
  }

  console.log('🎉 All currencies looped');
});
