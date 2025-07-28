import { test, expect } from '@playwright/test';

test('Negative test - invalid email input', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  console.log('🌐 Navigated to Transfi Buy page');

  await page.getByRole('button', { name: 'Buy BTC' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('baiondata123gmail.com');
  await page.getByRole('button', { name: 'Continue' }).click();

  const errorMsg = page.getByText(/must be a valid email/i);
  await expect(errorMsg).toBeVisible();
});