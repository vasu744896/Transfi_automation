import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');

  await page.waitForTimeout(5000);

  await page.locator('div').filter({ hasText: /^BTC$/ }).nth(2).click();

  await page.locator('div').filter({ hasText: /^ADA - \( Cardano \)$/ }).first().click();

  await page.waitForTimeout(5000);

  await page.locator('div').filter({ hasText: /^ADA$/ }).nth(1).click();

  await page.locator('div').filter({ hasText: /^ATOM - \( Cosmos \)$/ }).first().click();

  await page.waitForTimeout(5000);

  await page.locator('div').filter({ hasText: /^ATOM$/ }).nth(1).click();

  await page.locator('div').filter({ hasText: /^BNB - \( Binance_Smart_Chain \)$/ }).first().click();
  
  await page.waitForTimeout(5000);
});