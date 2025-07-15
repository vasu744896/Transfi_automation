import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  await page.getByRole('navigation').getByRole('img').click();
  await page.locator('div').filter({ hasText: /^Language$/ }).first().click();
  await page.getByPlaceholder('Search here').click();
  await page.getByPlaceholder('Search here').fill('thailand');
  await page.locator('div').filter({ hasText: /^แบบไทย-Thailand$/ }).nth(2).click();
  await page.getByText('ฉันต้องการจ่าย').click();
});